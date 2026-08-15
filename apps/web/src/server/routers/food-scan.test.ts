import { foodScanRouter } from './food-scan';
import { getAnthropicClient } from '../../lib/anthropic';
import { createSupabaseMock } from '../../test/supabase-mock';

jest.mock('../../lib/anthropic', () => ({
  getAnthropicClient: jest.fn(),
  CLAUDE_MODEL: 'test-model',
}));

const mockCreate = jest.fn();
const mockedGetClient = getAnthropicClient as jest.MockedFunction<typeof getAnthropicClient>;

beforeEach(() => {
  mockCreate.mockReset();
  mockedGetClient.mockReturnValue({ messages: { create: mockCreate } } as unknown as ReturnType<
    typeof getAnthropicClient
  >);
});

function caller() {
  return foodScanRouter.createCaller({ supabase: createSupabaseMock().supabase, userId: 'user-1' });
}

/** Claude replies with a single text block; the router parses its JSON. */
function respondWith(text: string) {
  mockCreate.mockResolvedValue({ content: [{ type: 'text', text }] });
}

const ITEM = {
  name: 'Idli',
  regional_name: 'idli',
  estimated_grams: 100,
  estimated_katori: 1,
  calories: 58,
  carbs_g: 12,
  gi_score: 60,
  gl_score: 7.2,
  confidence: 0.9,
};

describe('foodScan.scan — request', () => {
  it('sends the image and media type through to the vision call', async () => {
    respondWith(JSON.stringify({ items: [ITEM], thali_detected: false, raw_description: 'one idli' }));

    await caller().scan({ imageBase64: 'BASE64DATA', mediaType: 'image/png' });

    const [request] = mockCreate.mock.calls[0] as [{ model: string; messages: { content: unknown[] }[] }];
    expect(request.model).toBe('test-model');
    expect(request.messages[0].content[0]).toMatchObject({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: 'BASE64DATA' },
    });
  });

  it('defaults the media type to JPEG', async () => {
    respondWith(JSON.stringify({ items: [ITEM], thali_detected: false, raw_description: '' }));

    await caller().scan({ imageBase64: 'BASE64DATA' });

    const [request] = mockCreate.mock.calls[0] as [{ messages: { content: { source?: { media_type: string } }[] }[] }];
    expect(request.messages[0].content[0].source?.media_type).toBe('image/jpeg');
  });

  it('rejects an empty image payload without calling the model', async () => {
    await expect(caller().scan({ imageBase64: '' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rejects an unsupported media type', async () => {
    await expect(
      caller().scan({ imageBase64: 'x', mediaType: 'image/gif' as unknown as 'image/png' })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

describe('foodScan.scan — response parsing', () => {
  it('maps the model snake_case payload onto the camelCase app schema', async () => {
    respondWith(JSON.stringify({ items: [ITEM], thali_detected: true, raw_description: 'a thali' }));

    const result = await caller().scan({ imageBase64: 'x' });

    expect(result.thaliDetected).toBe(true);
    expect(result.rawDescription).toBe('a thali');
    expect(result.items[0]).toMatchObject({
      name: 'Idli',
      regionalName: 'idli',
      estimatedGrams: 100,
      estimatedKatori: 1,
      carbsG: 12,
      giScore: 60,
      glScore: 7.2,
      confidence: 0.9,
    });
  });

  it('strips markdown fencing the model sometimes adds', async () => {
    respondWith('```json\n' + JSON.stringify({ items: [ITEM], thali_detected: false, raw_description: '' }) + '```');

    const result = await caller().scan({ imageBase64: 'x' });

    expect(result.items).toHaveLength(1);
  });

  it('defaults thaliDetected and rawDescription when the model omits them', async () => {
    respondWith(JSON.stringify({ items: [ITEM] }));

    const result = await caller().scan({ imageBase64: 'x' });

    expect(result.thaliDetected).toBe(false);
    expect(result.rawDescription).toBe('');
  });

  it('carries candidates through for ambiguous items', async () => {
    respondWith(
      JSON.stringify({ items: [{ ...ITEM, candidates: ['Idli', 'Dhokla'] }], thali_detected: false, raw_description: '' })
    );

    const result = await caller().scan({ imageBase64: 'x' });

    expect(result.items[0].candidates).toEqual(['Idli', 'Dhokla']);
  });
});

// Spec §5.5.2 — anything the user must confirm is flagged rather than silently trusted.
describe('foodScan.scan — low-confidence flagging', () => {
  it.each([
    [0.95, false],
    [0.7, false], // threshold itself is trusted (flag is `confidence < 0.7`)
    [0.69, true],
    [0.1, true],
  ])('confidence %p sets needsConfirmation=%p', async (confidence, expected) => {
    respondWith(JSON.stringify({ items: [{ ...ITEM, confidence }], thali_detected: false, raw_description: '' }));

    const result = await caller().scan({ imageBase64: 'x' });

    expect(result.items[0].needsConfirmation).toBe(expected);
  });

  it('flags each item independently', async () => {
    respondWith(
      JSON.stringify({
        items: [{ ...ITEM, confidence: 0.9 }, { ...ITEM, name: 'Sambar', confidence: 0.4 }],
        thali_detected: false,
        raw_description: '',
      })
    );

    const result = await caller().scan({ imageBase64: 'x' });

    expect(result.items.map((i) => i.needsConfirmation)).toEqual([false, true]);
  });
});

describe('foodScan.scan — failure modes', () => {
  it('errors when the model returns no text block', async () => {
    mockCreate.mockResolvedValue({ content: [] });

    await expect(caller().scan({ imageBase64: 'x' })).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'No response from food scan.',
    });
  });

  it('errors on malformed JSON rather than surfacing a parse exception', async () => {
    respondWith('I could not identify this meal.');

    await expect(caller().scan({ imageBase64: 'x' })).rejects.toMatchObject({
      message: 'No food detected in this image.',
    });
  });

  it('errors when the model reports zero items', async () => {
    respondWith(JSON.stringify({ items: [], thali_detected: false, raw_description: 'empty plate' }));

    await expect(caller().scan({ imageBase64: 'x' })).rejects.toMatchObject({
      message: 'No food detected in this image.',
    });
  });

  it('errors when an item fails schema validation', async () => {
    // gi_score out of the 0..100 range the schema allows
    respondWith(JSON.stringify({ items: [{ ...ITEM, gi_score: 250 }], thali_detected: false, raw_description: '' }));

    await expect(caller().scan({ imageBase64: 'x' })).rejects.toMatchObject({
      message: 'No food detected in this image.',
    });
  });

  it('errors when a required nutrition field is missing', async () => {
    const { carbs_g: _omitted, ...withoutCarbs } = ITEM;
    respondWith(JSON.stringify({ items: [withoutCarbs], thali_detected: false, raw_description: '' }));

    await expect(caller().scan({ imageBase64: 'x' })).rejects.toMatchObject({
      message: 'No food detected in this image.',
    });
  });
});
