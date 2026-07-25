/** Spec §0 / §6.3 — brand palette and design tokens, shared by web and mobile */
export const COLORS = {
  navy: '#0F2340',
  teal: '#1B8F8A',
  saffron: '#F59E0B',
  white: '#FAFAFA',
  rose: '#E05A5A',
  jade: '#22C55E',
} as const;

export const RADIUS = {
  card: 12,
  control: 8,
} as const;

export const SHADOW_CARD = '0 2px 12px rgba(15,35,64,0.08)';

/** BG status color, calibrated to a user's target range */
export function bgStatusColor(value: number, targetMin: number, targetMax: number): string {
  if (value >= targetMin && value <= targetMax) return COLORS.jade;
  const distance = value < targetMin ? targetMin - value : value - targetMax;
  return distance > 40 ? COLORS.rose : COLORS.saffron;
}
