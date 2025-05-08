// src/utils/computeTrendline.ts
import { TrendType } from '../types/graph';

export function computeTrendline(
  x: number[],
  y: number[],
  trendType: TrendType
): { equation: string; r2: number; type: string } {
  if (x.length !== y.length || x.length < 2) {
    return { equation: '', r2: 0, type: trendType };
  }

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let yPred: number[] = [];
  let equation = '';

  if (trendType === 'linear') {
    const m =
      x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0) /
      x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
    const c = meanY - m * meanX;
    yPred = x.map((xi) => m * xi + c);
    equation = `y = ${m.toFixed(2)}x + ${c.toFixed(2)}`;
  } else if (trendType === 'proportional') {
    const m = x.reduce((sum, xi, i) => sum + xi * y[i], 0) / x.reduce((sum, xi) => sum + xi * xi, 0);
    yPred = x.map((xi) => m * xi);
    equation = `y = ${m.toFixed(2)}x`;
  } else if (trendType === 'inverse') {
    const xInv = x.map((xi) => 1 / xi);
    const meanXInv = mean(xInv);
    const m =
      xInv.reduce((sum, xi, i) => sum + (xi - meanXInv) * (y[i] - meanY), 0) /
      xInv.reduce((sum, xi) => sum + Math.pow(xi - meanXInv, 2), 0);
    const c = meanY - m * meanXInv;
    yPred = xInv.map((xi) => m * xi + c);
    equation = `y = ${m.toFixed(2)}/x + ${c.toFixed(2)}`;
  } else if (trendType === 'polynomial') {
    // Quadratic (2nd degree polynomial)
    const X = x;
    const X2 = x.map((xi) => xi * xi);

    const n = x.length;
    const sumX = X.reduce((a, b) => a + b, 0);
    const sumX2 = X2.reduce((a, b) => a + b, 0);
    const sumX3 = X.reduce((a, b) => a + b ** 3, 0);
    const sumX4 = X.reduce((a, b) => a + b ** 4, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = X.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2Y = X2.reduce((a, b, i) => a + b * y[i], 0);

    const denominator =
      n * (sumX2 * sumX4 - sumX3 * sumX3) -
      sumX * (sumX * sumX4 - sumX2 * sumX3) +
      sumX2 * (sumX * sumX3 - sumX2 * sumX2);

    const a =
      (sumY * (sumX2 * sumX4 - sumX3 * sumX3) -
        sumX * (sumXY * sumX4 - sumX3 * sumX2Y) +
        sumX2 * (sumXY * sumX3 - sumX2 * sumX2Y)) /
      denominator;

    const b =
      (n * (sumXY * sumX4 - sumX3 * sumX2Y) -
        sumY * (sumX * sumX4 - sumX2 * sumX3) +
        sumX2 * (sumX * sumX2Y - sumXY * sumX2)) /
      denominator;

    const c =
      (n * (sumX2 * sumX2Y - sumXY * sumX3) -
        sumX * (sumX * sumX2Y - sumXY * sumX2) +
        sumY * (sumX * sumX3 - sumX2 * sumX2)) /
      denominator;

    yPred = x.map((xi) => a + b * xi + c * xi * xi);
    equation = `y = ${c.toFixed(2)}x² + ${b.toFixed(2)}x + ${a.toFixed(2)}`;
  }

  // R² calculation
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPred[i], 2), 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
  const r2 = ssTot ? 1 - ssRes / ssTot : 0;

  return {
    equation,
    r2: parseFloat(r2.toFixed(3)),
    type: trendType,
  };
}
