// src/components/HighlightText.tsx
import React from 'react';

interface Match {
  label: string;
  level: number;
}

interface Props {

  html: string;
  keywords: { label: string; level: number }[];
  concepts: { label: string; level: number }[];
}

const getStyle = (level: number) => {
  if (level >= 7) return 'background-color: #bbf7d0; color: #065f46;'; // green
  if (level >= 5) return 'background-color: #bfdbfe; color: #1e3a8a;'; // blue
  if (level >= 3) return 'background-color: #fef08a; color: #78350f;'; // yellow
  return 'background-color: #e5e7eb; color: #1f2937;';
};

const HighlightText: React.FC<Props> = ({ html, keywords, concepts }) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const matches = [...(keywords || []), ...(concepts || [])];

  // Walk through text nodes and wrap matched words
  const walkAndHighlight = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let replaced = node.textContent!;
      matches.forEach(({ label, level }) => {
        const regex = new RegExp(`\\b(${label})\\b`, 'gi');
        replaced = replaced.replace(regex, (match) => {
          return `<span style="${getStyle(level)}" class="rounded px-1">${match}</span>`;
        });
      });

      if (replaced !== node.textContent) {
        const spanWrapper = document.createElement('span');
        spanWrapper.innerHTML = replaced;
        node.parentNode?.replaceChild(spanWrapper, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walkAndHighlight);
    }
  };

  Array.from(doc.body.childNodes).forEach(walkAndHighlight);

  return (
    <div
      className="prose max-w-none bg-white text-sm border p-3 rounded"
      dangerouslySetInnerHTML={{ __html: doc.body.innerHTML }}
    />
  );
};

export default HighlightText;
