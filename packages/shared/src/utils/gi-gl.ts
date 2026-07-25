/**
 * Glycemic Index / Glycemic Load helpers — spec §Domain Concepts.
 * GL = (GI × carbs) / 100
 */

export type GiCategory = 'low' | 'medium' | 'high';

export function calculateGl(giScore: number, carbsG: number): number {
  return Math.round(((giScore * carbsG) / 100) * 10) / 10;
}

export function giCategory(giScore: number): GiCategory {
  if (giScore <= 55) return 'low';
  if (giScore <= 69) return 'medium';
  return 'high';
}

/** Time-in-Range: % of readings within [min, max] inclusive */
export function calculateTir(values: number[], min: number, max: number): number {
  if (values.length === 0) return 0;
  const inRange = values.filter((v) => v >= min && v <= max).length;
  return Math.round((inRange / values.length) * 1000) / 10;
}
