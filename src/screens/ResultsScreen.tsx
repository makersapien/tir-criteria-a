// src/screens/ResultsScreen.tsx
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import { useStrandContext } from '../contexts/StrandContext';

interface Props {
  studentName: string;
  experimentChoice: string;
  experimentData: any;
  setScreen: React.Dispatch<React.SetStateAction<'welcome' | 'main' | 'results'>>;
  setStudentName: (name: string) => void;
  setExperimentChoice: (exp: string | null) => void;
  setCurrentStrand: (strand: number) => void;
  pdfDataUrl: string;
  setPdfDataUrl: (url: string) => void;
  isPdfGenerating: boolean;
  setIsPdfGenerating: (gen: boolean) => void;
}

const ResultsScreen: React.FC<Props> = ({
  studentName,
  experimentChoice,
  experimentData,
  setScreen,
  setStudentName,
  setExperimentChoice,
  setCurrentStrand,
  pdfDataUrl,
  setPdfDataUrl,
  isPdfGenerating,
  setIsPdfGenerating
}) => {
  const {
    strandProgress,
    userInputs,
    setStrandProgress,
    setUserInputs,
    earnedBadges,
    setEarnedBadges,
    points,
    setPoints,
    strandStatus,
    setStrandStatus,
  } = useStrandContext();

  const totalScore = strandProgress.reduce((sum, val) => sum + val, 0);
  const totalBadges = Object.values(earnedBadges ?? {}).filter(Boolean).length;
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);

  const generatePdfBlob = async () => {
    try {
      setIsPdfGenerating(true);
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(16);
      doc.text(`Lab Report - ${studentName}`, 105, y, { align: 'center' });
      y += 10;

      doc.setFontSize(12);
      doc.text(`Experiment: ${experimentData[experimentChoice]?.title}`, 20, y); y += 8;
      doc.text(`Student: ${studentName}`, 20, y); y += 8;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y); y += 8;
      doc.text(`Total Score: ${totalScore}/40`, 20, y); y += 8;
      doc.text(`Points: ${points}`, 20, y); y += 8;
      doc.text(`Badges Earned: ${totalBadges}/5`, 20, y); y += 12;

      for (let i = 0; i < 5; i++) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. Strand ${i + 1}`, 20, y); y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`Level: ${strandProgress[i] || 0}/8`, 20, y); y += 6;
        doc.text('Content:', 20, y); y += 6;

        const rawHtml = userInputs[`strand${i + 1}`]?.level8 || '';
        const div = document.createElement('div');
        div.innerHTML = rawHtml;

        for (const node of Array.from(div.childNodes)) {
          if (node.nodeType === 3) {
            const text = doc.splitTextToSize(node.textContent || '', 170);
            doc.text(text, 20, y);
            y += text.length * 6;
          } else if (node.nodeName === 'IMG') {
            const img = node as HTMLImageElement;
            if (img.src.startsWith('data:image')) {
              doc.addImage(img.src, 'JPEG', 20, y, 100, 60);
              y += 65;
            }
          } else if (node.nodeType === 1) {
            const el = node as HTMLElement;
            const text = doc.splitTextToSize(el.innerText, 170);
            doc.text(text, 20, y);
            y += text.length * 6;
          }

          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        }

        y += 10;
      }

      // Add badge summary
      const badgeLines = Object.entries(earnedBadges).map(([k, v]) => `${k}: ${v ? '✓' : '✗'}`);
      doc.setFont('helvetica', 'bold');
      doc.text('Badges:', 20, y); y += 8;
      doc.setFont('helvetica', 'normal');
      badgeLines.forEach(line => { doc.text(line, 20, y); y += 6; });

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfDataUrl(url);

    } catch (e) {
      alert('Failed to generate PDF');
      console.error(e);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleReset = () => {
    setScreen('welcome');
    setStudentName('');
    setExperimentChoice(null);
    setCurrentStrand(1);
    setStrandProgress([0, 0, 0, 0, 0]);
    setUserInputs({
      strand1: { level2: '', level4: '', level6: '', level8: '' },
      strand2: { level2: '', level4: '', level6: '', level8: '' },
      strand3: { level2: '', level4: '', level6: '', level8: '' },
      strand4: { level2: '', level4: '', level6: '', level8: '' },
      strand5: { level2: '', level4: '', level6: '', level8: '' }
    });
    setEarnedBadges({
      dataWizard: false,
      analysisAce: false,
      hypothesisHero: false,
      methodMaster: false,
      innovationInnovator: false
    });
    setPoints(0);
    setStrandStatus(['in progress', 'not started', 'not started', 'not started', 'not started']);
    setPdfDataUrl('');
    setIsPdfGenerating(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-4">
        Well Done, {studentName}!
      </h1>
      <p className="text-center text-lg mb-6">
        You completed the <strong>{experimentData[experimentChoice]?.title}</strong> investigation.
      </p>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">Total Score</p>
          <p className="text-3xl font-bold text-blue-800">{totalScore}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">Points</p>
          <p className="text-3xl font-bold text-blue-800">{points}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">Badges</p>
          <p className="text-3xl font-bold text-blue-800">{totalBadges}/5</p>
        </div>
      </div>

      {/* Preview Section */}
      {Array.from({ length: 5 }).map((_, i) => {
        const html = userInputs[`strand${i + 1}`]?.level8 || '';
        return (
          <div key={i} className="border p-4 rounded bg-white mb-4">
            <h3 className="text-lg font-semibold text-blue-700">Strand {i + 1}</h3>
            <p className="text-sm text-gray-500 mb-2">Level: {strandProgress[i] || 0}/8</p>
            <div
              className="prose max-w-none text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        );
      })}

      <div className="flex flex-col gap-4 mt-6">
        <button
          onClick={generatePdfBlob}
          disabled={isPdfGenerating}
          className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          {isPdfGenerating ? 'Generating PDF...' : 'Generate PDF Report'}
        </button>

        {pdfDataUrl && (
          <a
            href={pdfDataUrl}
            download={`Lab_Report_${studentName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
          >
            View & Download PDF
          </a>
        )}

        <button
          onClick={handleReset}
          className="bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500"
        >
          Try a Different Experiment
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
