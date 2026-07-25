import { BgLogInput, isAbnormalBg } from './bg-log';

describe('BgLogInput', () => {
  it('accepts a valid reading', () => {
    const result = BgLogInput.safeParse({ value: 118, context: 'fasting' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid context', () => {
    const result = BgLogInput.safeParse({ value: 118, context: 'lunchtime' });
    expect(result.success).toBe(false);
  });

  it('rejects a physiologically implausible value', () => {
    const result = BgLogInput.safeParse({ value: 5000, context: 'random' });
    expect(result.success).toBe(false);
  });

  it('rejects notes over 200 characters', () => {
    const result = BgLogInput.safeParse({
      value: 100,
      context: 'random',
      notes: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe('isAbnormalBg', () => {
  it('flags values below the safe floor', () => {
    expect(isAbnormalBg(53)).toBe(true);
  });

  it('flags values above the safe ceiling', () => {
    expect(isAbnormalBg(351)).toBe(true);
  });

  it('does not flag values within the safe range', () => {
    expect(isAbnormalBg(150)).toBe(false);
  });
});
