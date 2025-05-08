// src/utils/generateGraphImage.ts
import { Chart, registerables } from 'chart.js';
import { TrendTypes, TrendType } from '../types/graph';

Chart.register(...registerables);

function getTrendlineEquation(
  x: number[],
  y: number[],
  type: TrendType
): { points: { x: number; y: number }[]; label: string } {
  const n = x.length;
  if (n < 2) return { points: [], label: '' };

  let points: { x: number; y: number }[] = [];
  let label = '';

  switch (type) {
    case TrendTypes.LINEAR: {
      const xMean = x.reduce((a, b) => a + b) / n;
      const yMean = y.reduce((a, b) => a + b) / n;
      const num = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
      const den = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
      const m = num / den;
      const c = yMean - m * xMean;

      points = x.map((xi) => ({ x: xi, y: m * xi + c }));

      const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
      const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (m * x[i] + c), 2), 0);
      const r2 = 1 - ssRes / ssTot;

      label = `y = ${m.toFixed(2)}x + ${c.toFixed(2)} (R² = ${r2.toFixed(2)})`;
      break;
    }

    case TrendTypes.PROPORTIONAL: {
      const m = y.reduce((sum, yi, i) => sum + yi / x[i], 0) / n;
      points = x.map((xi) => ({ x: xi, y: m * xi }));
      label = `y = ${m.toFixed(2)}x`;
      break;
    }

    case TrendTypes.INVERSE: {
      const m = y.reduce((sum, yi, i) => sum + yi * x[i], 0) / n;
      points = x.map((xi) => ({ x: xi, y: m / xi }));
      label = `y = ${m.toFixed(2)}/x`;
      break;
    }

    case TrendTypes.POLYNOMIAL: {
      const m = y.reduce((sum, yi, i) => sum + yi / (x[i] ** 2 || 1), 0) / n;
      points = x.map((xi) => ({ x: xi, y: m * xi * xi }));
      label = `y = ${m.toFixed(2)}x²`;
      break;
    }

    default:
      break;
  }

  return { points, label };
}

interface GenerateGraphImageOptions {
  title: string;
  xAxis: string;
  yAxis: string;
  graphType: 'bar' | 'scatter';
  trendType: TrendType;
  data: {
    x: number[];
    y: number[];
  };
}

export async function generateGraphImage({
  title,
  xAxis,
  yAxis,
  graphType,
  trendType,
  data,
}: GenerateGraphImageOptions): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const trend = getTrendlineEquation(data.x, data.y, trendType);

  const chart = new Chart(ctx, {
    type: graphType === 'bar' ? 'bar' : 'scatter',
    data: {
      labels: data.x,
      datasets: [
        {
          label: 'Data',
          data: data.x.map((x, i) => ({ x, y: data.y[i] })),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointRadius: 4,
          parsing: false, // ⬅️ Required for object {x, y} points
        },
        ...(trend.points.length
          ? [
              {
                label: trend.label,
                data: trend.points,
                type: 'line' as 'line',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
              },
            ]
          : []),
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: title,
        },
        legend: {
          display: true,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: xAxis,
          },
        },
        y: {
          title: {
            display: true,
            text: yAxis,
          },
        },
      },
    },
  });

  await new Promise((res) => setTimeout(res, 500));
  const base64Image = canvas.toDataURL('image/png');
  chart.destroy();
  return base64Image;
}
