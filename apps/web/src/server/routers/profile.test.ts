import { profileRouter } from './profile';
import { createSupabaseMock, dbError } from '../../test/supabase-mock';

const USER = 'user-1';

function caller(results = {}) {
  const mock = createSupabaseMock(results);
  return { caller: profileRouter.createCaller({ supabase: mock.supabase, userId: USER }), mock };
}

const ONBOARDING = {
  fullName: 'Asha Rao',
  dateOfBirth: '1980-05-20',
  gender: 'female' as const,
  diabetesType: 'type2' as const,
  diagnosisYear: 2015,
  cuisinePreference: 'south_indian' as const,
  dietaryRestriction: 'vegetarian' as const,
};

describe('profile.get', () => {
  it('reads the caller row by id and tolerates a missing profile', async () => {
    const { caller: c, mock } = caller({ user_profiles: { data: null } });

    await expect(c.get()).resolves.toBeNull();
    expect(mock.argsFor('user_profiles', 'eq')).toEqual(['id', USER]);
    expect(mock.callsFor('user_profiles').some((call) => call.method === 'maybeSingle')).toBe(true);
  });

  it('propagates a database error', async () => {
    const { caller: c } = caller({ user_profiles: dbError('denied') });

    await expect(c.get()).rejects.toMatchObject({ message: 'denied' });
  });
});

describe('profile.completeOnboarding', () => {
  it('upserts against the caller id and stamps onboarded_at', async () => {
    const { caller: c, mock } = caller({ user_profiles: {} });
    const before = Date.now();

    await expect(c.completeOnboarding(ONBOARDING)).resolves.toEqual({ success: true });

    const [payload] = mock.argsFor('user_profiles', 'upsert') as [{ id: string; onboarded_at: string }];
    expect(payload.id).toBe(USER);
    expect(Date.parse(payload.onboarded_at)).toBeGreaterThanOrEqual(before);
  });

  // A signup trigger creates the bare row, so this must not fail when one already exists.
  it('uses upsert rather than insert', async () => {
    const { caller: c, mock } = caller({ user_profiles: {} });

    await c.completeOnboarding(ONBOARDING);

    const methods = mock.callsFor('user_profiles').map((call) => call.method);
    expect(methods).toContain('upsert');
    expect(methods).not.toContain('insert');
  });

  it('applies the spec default BG targets and units when omitted', async () => {
    const { caller: c, mock } = caller({ user_profiles: {} });

    await c.completeOnboarding(ONBOARDING);

    expect(mock.argsFor('user_profiles', 'upsert')).toEqual([
      expect.objectContaining({
        target_bg_fasting_min: 80,
        target_bg_fasting_max: 130,
        target_bg_post_meal_max: 180,
        units_preference: 'mg/dL',
        language_pref: 'en',
      }),
    ]);
  });

  it('preserves explicitly chosen targets and language', async () => {
    const { caller: c, mock } = caller({ user_profiles: {} });

    await c.completeOnboarding({
      ...ONBOARDING,
      targetBgFastingMin: 90,
      targetBgFastingMax: 120,
      targetBgPostMealMax: 160,
      languagePref: 'te',
      unitsPreference: 'mmol/L',
    });

    expect(mock.argsFor('user_profiles', 'upsert')).toEqual([
      expect.objectContaining({
        target_bg_fasting_min: 90,
        target_bg_fasting_max: 120,
        target_bg_post_meal_max: 160,
        language_pref: 'te',
        units_preference: 'mmol/L',
      }),
    ]);
  });

  it.each([
    ['an unsupported language', { languagePref: 'fr' }],
    ['an unknown diabetes type', { diabetesType: 'type3' }],
    ['an unknown cuisine', { cuisinePreference: 'thai' }],
    ['an implausible diagnosis year', { diagnosisYear: 1900 }],
    ['a blank name', { fullName: '' }],
  ])('rejects %s', async (_label, override) => {
    const { caller: c, mock } = caller();

    await expect(
      c.completeOnboarding({ ...ONBOARDING, ...override } as unknown as typeof ONBOARDING)
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mock.calls).toHaveLength(0);
  });
});
