// src/utils/generatePDF.ts
import jsPDF from 'jspdf';

export async function generatePDF({
  studentName,
  experimentTitle,
  strandProgress,
  userInputs,
  points,
  earnedBadges
}: {
  studentName: string;
  experimentTitle: string;
  strandProgress: number[];
  userInputs: Record<string, { [level: string]: string }>;
  points: number;
  earnedBadges: Record<string, boolean>;
}): Promise<Blob> {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text(`Lab Report - ${studentName}`, 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.text(`Experiment: ${experimentTitle}`, 20, y); y += 8;
  doc.text(`Student: ${studentName}`, 20, y); y += 8;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y); y += 8;
  doc.text(`Total Score: ${strandProgress.reduce((a, b) => a + b, 0)}/40`, 20, y); y += 8;
  doc.text(`Points: ${points}`, 20, y); y += 8;
  doc.text(`Badges Earned: ${Object.values(earnedBadges).filter(Boolean).length}/5`, 20, y); y += 10;

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

    y += 8;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Badges Summary:', 20, y); y += 8;
  doc.setFont('helvetica', 'normal');
  Object.entries(earnedBadges).forEach(([badge, earned]) => {
    doc.text(`${badge}: ${earned ? '✓' : '✗'}`, 20, y);
    y += 6;
  });

  return doc.output('blob');
}
