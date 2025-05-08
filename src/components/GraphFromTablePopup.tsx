// src/components/GraphFromTablePopup.tsx
import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import GraphPreview from './GraphPreview';
import { generateGraphImage } from '../utils/generateGraphImage';
import { computeTrendline } from '../utils/computeTrendline';
import { TrendType } from '../types/graph';

interface GraphFromTablePopupProps {
  editor: Editor;
  onClose: () => void;
  onInsert: (img: string) => void; 
}

const GraphFromTablePopup: React.FC<GraphFromTablePopupProps> = ({ editor, onClose }) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [graphTitle, setGraphTitle] = useState('');
  const [graphType, setGraphType] = useState<'bar' | 'scatter'>('scatter');
  const [trendType, setTrendType] = useState<TrendType>('none');
  const [graphData, setGraphData] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [trendResult, setTrendResult] = useState<{ equation: string; r2: number; type: string }>({
    equation: '',
    r2: 0,
    type: 'none',
  });

  useEffect(() => {
    const html = editor.getHTML();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return;

    const firstRow = table.querySelector('tr');
    const headers = Array.from(firstRow?.querySelectorAll('th, td') || []).map((cell) =>
      cell.textContent?.trim() || ''
    );

    setColumns(headers);
    if (headers.length >= 2) {
      setXAxis(headers[0]);
      setYAxis(headers[headers.length - 1]);
    }

    const rows = Array.from(table.querySelectorAll('tr')).slice(1);
    const dataX: number[] = [];
    const dataY: number[] = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      const xCell = cells[0]?.textContent?.trim();
      const yCell = cells[cells.length - 1]?.textContent?.trim();
      if (xCell && yCell) {
        const xVal = parseFloat(xCell);
        const yVal = parseFloat(yCell);
        if (!isNaN(xVal) && !isNaN(yVal)) {
          dataX.push(xVal);
          dataY.push(yVal);
        }
      }
    });

    setGraphData({ x: dataX, y: dataY });
  }, [editor]);

  useEffect(() => {
    if (graphData.x.length && graphData.y.length && trendType !== 'none') {
      const trend = computeTrendline(graphData.x, graphData.y, trendType);
      setTrendResult(trend);
    } else {
      setTrendResult({ equation: '', r2: 0, type: 'none' });
    }
  }, [graphData, trendType]);

  const insertGraph = async () => {
    if (graphData.x.length && graphData.y.length) {
      const canvas = document.createElement('canvas');
      const base64Image = await generateGraphImage({
        title: graphTitle,
        xAxis,
        yAxis,
        graphType,
        trendType,
        data: {
          x: graphData.x,
          y: graphData.y
        }
      });
      

      editor.chain().focus().setImage({ src: base64Image }).run();
      onClose();
    }
  };

  return (
    <div className="popup bg-white border border-gray-300 rounded shadow-md p-4 absolute z-20 left-4 top-24 w-[350px] md:w-[480px]">
      <h4 className="text-sm font-semibold mb-2">📈 Create Graph from Table</h4>

      <label className="block mb-2 text-sm">
        Graph Title:
        <input
          type="text"
          value={graphTitle}
          onChange={(e) => setGraphTitle(e.target.value)}
          className="w-full mt-1 border px-2 py-1 text-sm rounded"
        />
      </label>

      <div className="flex gap-2 mb-2">
        <label className="flex-1 text-sm">
          X Axis:
          <select
            className="w-full mt-1 border px-2 py-1 text-sm rounded"
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
          >
            {columns.map((col, i) => (
              <option key={i} value={col}>
                {col}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-sm">
          Y Axis:
          <select
            className="w-full mt-1 border px-2 py-1 text-sm rounded"
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
          >
            {columns.map((col, i) => (
              <option key={i} value={col}>
                {col}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2 mb-3">
        <label className="flex-1 text-sm">
          Graph Type:
          <select
            className="w-full mt-1 border px-2 py-1 text-sm rounded"
            value={graphType}
            onChange={(e) => setGraphType(e.target.value as any)}
          >
            <option value="scatter">Scatter</option>
            <option value="bar">Bar</option>
          </select>
        </label>
        <label className="flex-1 text-sm">
          Trendline:
          <select
            className="w-full mt-1 border px-2 py-1 text-sm rounded"
            value={trendType}
            onChange={(e) => setTrendType(e.target.value as TrendType)}
          >
            <option value="none">None</option>
            <option value="linear">Linear (y = mx + c)</option>
            <option value="proportional">Direct (y = mx)</option>
            <option value="inverse">Inverse (y = m/x)</option>
            <option value="polynomial">Polynomial (y = mxⁿ + c)</option>
          </select>
        </label>
      </div>

      <div className="text-sm mb-3 text-gray-500">Preview your graph and equation before inserting.</div>

      <div className="bg-gray-100 border rounded p-2 mb-3">
        <GraphPreview
          xData={graphData.x}
          yData={graphData.y}
          title={graphTitle}
          xLabel={xAxis}
          yLabel={yAxis}
          type={graphType}
          trendline={trendResult}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <button onClick={onClose} className="text-sm text-gray-500">
          Cancel
        </button>
        <button
          onClick={insertGraph}
          className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition"
        >
          Insert Graph
        </button>
      </div>
    </div>
  );
};

export default GraphFromTablePopup;
