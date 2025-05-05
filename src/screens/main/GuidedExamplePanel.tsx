import React from 'react';
import ReactMarkdown from 'react-markdown';
import strandExemplars from '../../data/strandExemplars';
import { Collapse } from 'antd';
import remarkGfm from "remark-gfm";

import type { StrandContent } from '../../types/strand';

const { Panel } = Collapse;

const GuidedExamplePanel: React.FC<{ currentStrand: number }> = ({ currentStrand }) => {
  const strandIndex = currentStrand - 1;
  const currentStrandData = strandExemplars[strandIndex];

  if (!currentStrandData) return <p className="text-red-500">Strand data not available.</p>;

  return (
    <div>
      <h2 className="font-semibold text-lg mb-2">{currentStrandData.strandName}</h2>
      <p className="text-gray-700 mb-4 whitespace-pre-line">{currentStrandData.strandDescription}</p>
      <Collapse
          accordion
          items={currentStrandData.levels.map((lvl, idx) => ({
            key: String(idx),
            label: lvl.title,
            children: (
              <div className="prose max-w-none text-sm text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lvl.markdown}
                </ReactMarkdown>
              </div>
            ),
          }))}
       />
    </div>
  );
};

export default GuidedExamplePanel;
