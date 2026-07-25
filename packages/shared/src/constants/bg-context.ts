import { BgContext } from '../schemas/bg-log';

export const BG_CONTEXT_LABELS: Record<BgContext, string> = {
  fasting: 'Fasting',
  before_breakfast: 'Before Breakfast',
  after_breakfast: 'After Breakfast',
  before_lunch: 'Before Lunch',
  after_lunch: 'After Lunch',
  before_dinner: 'Before Dinner',
  after_dinner: 'After Dinner',
  bedtime: 'Bedtime',
  random: 'Random',
};
