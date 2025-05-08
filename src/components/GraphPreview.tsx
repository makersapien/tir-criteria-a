// src/components/GraphPreview.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

interface Props {
  xData: number[];
  yData: number[];
  xLabel: string;
  yLabel: string;
  title: string;
  type: 'bar' | 'scatter';
  trendline: {
    equation: string;
    r2: number;
    type: string;
  };
}

const GraphPreview: React.FC<Props> = ({
  xData,
  yData,
  xLabel,
  yLabel,
  title,
  trendline,
}) => {
  const dataPoints = xData.map((val, i) => ({ x: val, y: yData[i] }));

  const getTrendlineY = (xVal: number): number => {
    const { type, equation } = trendline;
    const numbers = equation.match(/-?\d+(\.\d+)?/g)?.map(Number);
    if (!numbers) return 0;
    const [a, b = 0, n = 2] = numbers;

    switch (type) {
      case 'linear':
        return a * xVal + b;
      case 'proportional':
        return a * xVal;
      case 'inverse':
        return xVal !== 0 ? a / xVal : 0;
      case 'polynomial':
        return a * Math.pow(xVal, n) + b;
      default:
        return 0;
    }
  };

  const trendlinePoints = xData.map((val) => ({
    x: val,
    y: getTrendlineY(val),
  }));

  const chartData: ChartData<'line', { x: number; y: number }[]> = {
    datasets: [
      {
        label: title,
        data: dataPoints,
        borderColor: 'rgba(0, 123, 255, 0.6)',
        backgroundColor: 'rgba(0, 123, 255, 0.3)',
        pointRadius: 5,
        showLine: false,
      },
      {
        label: `Trendline: ${trendline.equation}, R² = ${trendline.r2.toFixed(3)}`,
        data: trendlinePoints,
        borderColor: 'rgba(40, 167, 69, 0.8)',
        backgroundColor: 'rgba(40, 167, 69, 0.3)',
        pointRadius: 0,
        fill: false,
        tension: 0.3,
        parsing: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: xLabel,
        },
      },
      y: {
        type: 'linear' as const,
        title: {
          display: true,
          text: yLabel,
        },
      },
    },
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: title },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default GraphPreview;
