import { mealsRouter } from './meals';
import { createSupabaseMock, dbError } from '../../test/supabase-mock';

const USER = 'user-1';

function caller(results = {}) {
  const mock = createSupabaseMock(results);
  return { caller: mealsRouter.createCaller({ supabase: mock.supabase, userId: USER }), mock };
}

/** meals.create writes to meal_logs first, then meal_items. */
function createResults(mealLog: unknown = { id: 'meal-1' }, itemsResult = {}) {
  return { meal_logs: { data: mealLog }, meal_items: itemsResult };
}

describe('meals.searchFoods', () => {
  it('runs a websearch text query against the public foods table', async () => {
    const { caller: c, mock } = caller({ foods: { data: [{ id: 'f1' }] } });

    await expect(c.searchFoods({ query: 'idli' })).resolves.toEqual([{ id: 'f1' }]);
    // `config` must be passed, or postgrest emits a to_tsvector() expression
    // that cannot use the GIN index on to_tsvector('english', name_en).
    expect(mock.argsFor('foods', 'textSearch')).toEqual([
      'name_en',
      'idli',
      { type: 'websearch', config: 'english' },
    ]);
    expect(mock.argsFor('foods', 'limit')).toEqual([20]);
  });

  it('rejects an empty query', async () => {
    const { caller: c, mock } = caller();

    await expect(c.searchFoods({ query: '' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mock.calls).toHaveLength(0);
  });
});

describe('meals.list', () => {
  it('joins meal items and scopes to the caller', async () => {
    const { caller: c, mock } = caller({ meal_logs: { data: [] } });

    await c.list();

    expect(mock.argsFor('meal_logs', 'select')).toEqual(['*, meal_items(*)']);
    expect(mock.argsFor('meal_logs', 'eq')).toEqual(['user_id', USER]);
    expect(mock.argsFor('meal_logs', 'limit')).toEqual([20]);
  });

  it('rejects a limit above 100', async () => {
    const { caller: c } = caller();

    await expect(c.list({ limit: 101 })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

// photo_url holds a storage object path. Signing it on read is what keeps
// meal photos working past the lifetime of any one signed URL.
describe('meals.list — photo signing', () => {
  function listWith(rows: unknown[], signedUrls: Record<string, string> = {}) {
    const mock = createSupabaseMock({ meal_logs: { data: rows } }, { signedUrls });
    return { caller: mealsRouter.createCaller({ supabase: mock.supabase, userId: USER }), mock };
  }

  it('signs stored object paths on read', async () => {
    const { caller: c, mock } = listWith([{ id: 'm1', photo_url: 'user-1/1.jpg', meal_items: [] }], {
      'user-1/1.jpg': 'https://storage.test/signed-1',
    });

    const [meal] = await c.list();

    expect(meal.photo_signed_url).toBe('https://storage.test/signed-1');
    expect(mock.argsFor('storage:meal-photos', 'createSignedUrls')).toEqual([['user-1/1.jpg'], 3600]);
  });

  it('signs every distinct path in a single batched call', async () => {
    const { caller: c, mock } = listWith([
      { id: 'm1', photo_url: 'user-1/1.jpg', meal_items: [] },
      { id: 'm2', photo_url: 'user-1/2.jpg', meal_items: [] },
      { id: 'm3', photo_url: 'user-1/1.jpg', meal_items: [] },
    ]);

    await c.list();

    expect(mock.callsFor('storage:meal-photos')).toHaveLength(1);
    expect(mock.argsFor('storage:meal-photos', 'createSignedUrls')?.[0]).toEqual(['user-1/1.jpg', 'user-1/2.jpg']);
  });

  it('leaves meals without a photo null and does not call storage', async () => {
    const { caller: c, mock } = listWith([{ id: 'm1', photo_url: null, meal_items: [] }]);

    const [meal] = await c.list();

    expect(meal.photo_signed_url).toBeNull();
    expect(mock.callsFor('storage:meal-photos')).toHaveLength(0);
  });

  // Rows written before the fix stored a full (long-expired) signed URL.
  it('passes a legacy stored URL through instead of signing it as a path', async () => {
    const legacy = 'https://storage.test/old?token=expired';
    const { caller: c, mock } = listWith([{ id: 'm1', photo_url: legacy, meal_items: [] }]);

    const [meal] = await c.list();

    expect(meal.photo_signed_url).toBe(legacy);
    expect(mock.callsFor('storage:meal-photos')).toHaveLength(0);
  });
});

describe('meals.create — totals', () => {
  it('multiplies carbs and calories by quantity across items', async () => {
    const { caller: c, mock } = caller(createResults());

    await c.create({
      mealType: 'lunch',
      items: [
        { foodNameRaw: 'Rice', quantity: 2, servingUnit: 'katori', carbsG: 30, calories: 150 },
        { foodNameRaw: 'Dal', quantity: 1, servingUnit: 'katori', carbsG: 15, calories: 90 },
      ],
    });

    expect(mock.argsFor('meal_logs', 'insert')).toEqual([
      expect.objectContaining({ total_carbs_g: 75, total_calories: 390 }),
    ]);
  });

  it('treats missing nutrition values as zero rather than NaN', async () => {
    const { caller: c, mock } = caller(createResults());

    await c.create({
      mealType: 'snack',
      items: [{ foodNameRaw: 'Unknown snack', quantity: 3, servingUnit: 'piece' }],
    });

    expect(mock.argsFor('meal_logs', 'insert')).toEqual([
      expect.objectContaining({ total_carbs_g: 0, total_calories: 0 }),
    ]);
  });

  it('supports fractional quantities', async () => {
    const { caller: c, mock } = caller(createResults());

    await c.create({
      mealType: 'breakfast',
      items: [{ foodNameRaw: 'Idli', quantity: 0.5, servingUnit: 'piece', carbsG: 12, calories: 58 }],
    });

    expect(mock.argsFor('meal_logs', 'insert')).toEqual([
      expect.objectContaining({ total_carbs_g: 6, total_calories: 29 }),
    ]);
  });
});

// A thali is one meal_log with several meal_items, not one composite food (CLAUDE.md domain rules).
describe('meals.create — thali shape', () => {
  it('writes one meal_log and links every item to it', async () => {
    const { caller: c, mock } = caller(createResults({ id: 'meal-99' }));

    await c.create({
      mealType: 'dinner',
      items: [
        { foodNameRaw: 'Roti', quantity: 2, servingUnit: 'piece', carbsG: 15 },
        { foodNameRaw: 'Sabzi', quantity: 1, servingUnit: 'katori', carbsG: 8 },
        { foodNameRaw: 'Curd', quantity: 1, servingUnit: 'katori', carbsG: 4 },
      ],
    });

    expect(mock.callsFor('meal_logs').filter((call) => call.method === 'insert')).toHaveLength(1);

    const [items] = mock.argsFor('meal_items', 'insert') as [{ meal_log_id: string; food_name_raw: string }[]];
    expect(items).toHaveLength(3);
    expect(items.every((item) => item.meal_log_id === 'meal-99')).toBe(true);
    expect(items.map((item) => item.food_name_raw)).toEqual(['Roti', 'Sabzi', 'Curd']);
  });

  it('defaults quantity to 1 and serving unit to katori', async () => {
    const { caller: c, mock } = caller(createResults());

    await c.create({ mealType: 'lunch', items: [{ foodNameRaw: 'Sambar' }] });

    const [items] = mock.argsFor('meal_items', 'insert') as [{ quantity: number; serving_unit: string }[]];
    expect(items[0]).toMatchObject({ quantity: 1, serving_unit: 'katori' });
  });

  it('requires at least one item', async () => {
    const { caller: c, mock } = caller();

    await expect(c.create({ mealType: 'lunch', items: [] })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mock.calls).toHaveLength(0);
  });

  it('rejects an unknown meal type', async () => {
    const { caller: c } = caller();

    await expect(
      c.create({ mealType: 'brunch' as unknown as 'lunch', items: [{ foodNameRaw: 'x' }] })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('propagates a meal_items failure', async () => {
    const { caller: c } = caller(createResults({ id: 'meal-1' }, dbError('items insert failed')));

    await expect(c.create({ mealType: 'lunch', items: [{ foodNameRaw: 'Rice' }] })).rejects.toMatchObject({
      message: 'items insert failed',
    });
  });

  // The two writes are separate statements, so a failed item insert would
  // otherwise leave a meal with totals but no components behind them.
  it('removes the meal log when the item insert fails', async () => {
    const { caller: c, mock } = caller(createResults({ id: 'meal-1' }, dbError('items insert failed')));

    await expect(c.create({ mealType: 'lunch', items: [{ foodNameRaw: 'Rice' }] })).rejects.toBeDefined();

    expect(mock.callsFor('meal_logs').some((call) => call.method === 'delete')).toBe(true);
    expect(mock.allArgsFor('meal_logs', 'eq')).toEqual([
      ['id', 'meal-1'],
      ['user_id', USER],
    ]);
  });

  it('leaves the meal log in place when the items insert succeeds', async () => {
    const { caller: c, mock } = caller(createResults());

    await c.create({ mealType: 'lunch', items: [{ foodNameRaw: 'Rice' }] });

    expect(mock.callsFor('meal_logs').some((call) => call.method === 'delete')).toBe(false);
  });

  it('does not attempt item inserts when the meal_log insert fails', async () => {
    const { caller: c, mock } = caller({ meal_logs: dbError('meal insert failed') });

    await expect(c.create({ mealType: 'lunch', items: [{ foodNameRaw: 'Rice' }] })).rejects.toMatchObject({
      message: 'meal insert failed',
    });
    expect(mock.callsFor('meal_items')).toHaveLength(0);
  });
});
