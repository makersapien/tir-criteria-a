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
    <>
      {/* Dimmed backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose} />
  
      {/* Centered popup */}
      <div className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-[90%] max-w-xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📈 Create Graph from Table
        </h4>
  
        {/* Graph Title */}
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Graph Title:
        </label>
        <input
          type="text"
          value={graphTitle}
          onChange={(e) => setGraphTitle(e.target.value)}
          className="w-full mb-4 border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
  
        {/* X & Y Axis Selection */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              X Axis:
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {columns.map((col, i) => (
                <option key={i} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Y Axis:
            </label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {columns.map((col, i) => (
                <option key={i} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        {/* Graph Type & Trendline */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Graph Type:
            </label>
            <select
              value={graphType}
              onChange={(e) => setGraphType(e.target.value as any)}
              className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scatter">Scatter</option>
              <option value="bar">Bar</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Trendline:
            </label>
            <select
              value={trendType}
              onChange={(e) => setTrendType(e.target.value as any)}
              disabled={graphType === 'bar'} // disable trendline for bar
              className={`w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 ${graphType === 'bar' ? 'bg-gray-200 cursor-not-allowed' : 'focus:ring-blue-500'}`}
            >
              <option value="none">None</option>
              <option value="linear">Linear (y = mx + c)</option>
              <option value="proportional">Direct (y = mx)</option>
              <option value="inverse">Inverse (y = m/x)</option>
              <option value="polynomial">Polynomial (y = mxⁿ + c)</option>
            </select>
          </div>
        </div>
  
        {/* Preview Note */}
        <p className="text-sm text-gray-500 mb-2">
          Preview your graph and equation before inserting.
        </p>
  
        {/* Graph Preview */}
        <div className="bg-gray-100 border rounded p-3 mb-4">
        {graphType === 'scatter' && (
          <GraphPreview
            xData={graphData.x}
            yData={graphData.y}
            title={graphTitle}
            xLabel={xAxis}
            yLabel={yAxis}
            type={graphType}
            trendline={trendResult}
          />
          )}
          {graphType === 'bar' && (
            <GraphPreview
              xData={graphData.x}
              yData={graphData.y}
              title={graphTitle}
              xLabel={xAxis}
              yLabel={yAxis}
              type={graphType}
              trendline={{ type: 'none', equation: '', r2: 0 }}
            />
        )}

        </div>
  
        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={insertGraph}
            className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700 transition"
          >
            Insert Graph
          </button>
        </div>
      </div>
    </>
  );
  
};

export default GraphFromTablePopup;
