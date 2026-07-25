import { calculateGl, giCategory, calculateTir } from './gi-gl';

describe('calculateGl', () => {
  it('computes GL = (GI * carbs) / 100', () => {
    expect(calculateGl(70, 50)).toBe(35);
  });

  it('rounds to one decimal place', () => {
    expect(calculateGl(55, 33)).toBeCloseTo(18.2, 1);
  });

  it('returns 0 for 0 carbs', () => {
    expect(calculateGl(90, 0)).toBe(0);
  });
});

describe('giCategory', () => {
  it('classifies low GI at or below 55', () => {
    expect(giCategory(55)).toBe('low');
    expect(giCategory(20)).toBe('low');
  });

  it('classifies medium GI between 56 and 69', () => {
    expect(giCategory(56)).toBe('medium');
    expect(giCategory(69)).toBe('medium');
  });

  it('classifies high GI at or above 70', () => {
    expect(giCategory(70)).toBe('high');
    expect(giCategory(100)).toBe('high');
  });
});

describe('calculateTir', () => {
  it('returns the percentage of readings within range', () => {
    expect(calculateTir([90, 100, 200, 130], 80, 130)).toBe(75);
  });

  it('returns 0 for an empty list', () => {
    expect(calculateTir([], 80, 130)).toBe(0);
  });

  it('is inclusive of the boundary values', () => {
    expect(calculateTir([80, 130], 80, 130)).toBe(100);
  });
});
