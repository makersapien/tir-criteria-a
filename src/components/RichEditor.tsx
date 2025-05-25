// src/components/RichEditor.tsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import GraphFromTablePopup from './GraphFromTablePopup';
import './RichEditor.css';
import { useStrandSync } from '../hooks/useStrandSync';
import { useStrandContext } from '../contexts/StrandContext'; // ✅ adjust path if needed
import { supabase } from '../lib/supabaseClient';

declare global {
  interface Window {
    typingTimeout?: ReturnType<typeof setTimeout>;
  }
}

// ✅ Helper to safely extract a valid UUID from URL
const getValidStudentId = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('studentId');
  if (id && /^[0-9a-fA-F-]{36}$/.test(id)) return id;
  console.warn('❌ Invalid or missing studentId:', id);
  return null;
};

interface Props {
  content: string;
  onChange: (value: string) => void;
  currentStudentId: string;
  currentStrand: number;
  evaluatedLevel?: number; // ✅ NEW
  currentExperimentChoice: 'distance' | 'magnets';
  sessionCode?: string | null;
}

const RichEditor: React.FC<Props> = ({
  content,
  onChange,
  currentStudentId,
  currentStrand,
  currentExperimentChoice,
  sessionCode = null,
}) => {
  const [showTablePopup, setShowTablePopup] = useState(false);
  const [showGraphPopup, setShowGraphPopup] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    // inside useEditor config block, around line 63

      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange(html);

        // ✅ Debounced is_typing sync
        if (studentId && sessionCode) {
          supabase
            .from('responses')
            .update({ is_typing: true })
            .eq('student_id', studentId)
            .eq('session_code', sessionCode)
            .eq('experiment', currentExperimentChoice);

          if (window.typingTimeout) clearTimeout(window.typingTimeout);
          window.typingTimeout = setTimeout(() => {
            supabase
              .from('responses')
              .update({ is_typing: false })
              .eq('student_id', studentId)
              .eq('session_code', sessionCode)
              .eq('experiment', currentExperimentChoice);
          }, 3000);
        }
      }

    
  });

  
  
  // ✅ Use helper to get validated studentId from URL instead of prop
  const studentId = getValidStudentId();
  const { strandProgress } = useStrandContext();

  const { syncStatus } = useStrandSync({
    studentId: studentId || '',
    experiment: currentExperimentChoice,
    sessionCode,
    strandhoot: 'crit-c-magnetism',
    currentStrand,
    content,
    evaluatedLevel: strandProgress[currentStrand - 1],
    onLoad: (savedContent) => {
      if (editor && editor.isEmpty) {
        editor.commands.setContent(savedContent);
      }
    },
  });

  const addImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      editor?.chain().focus().insertContent('<p></p>').setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({
      rows: tableRows,
      cols: tableCols,
      withHeaderRow: true,
    }).run();
    setShowTablePopup(false);
  };

  if (!editor) return null;

  return (
    <div className="editor-wrapper relative border rounded-md overflow-visible bg-white">
      {/* Toolbar */}
      <div className="editor-toolbar bg-gray-100 px-4 py-2 border-b border-gray-300 flex flex-wrap gap-2 items-center text-sm">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button onClick={() => setShowTablePopup(true)}>➕ Table</button>
        <button onClick={() => editor.chain().focus().addColumnBefore().run()}>↤ Col</button>
        <button onClick={() => editor.chain().focus().addColumnAfter().run()}>Col ↦</button>
        <button onClick={() => editor.chain().focus().addRowBefore().run()}>↑ Row</button>
        <button onClick={() => editor.chain().focus().addRowAfter().run()}>↓ Row</button>
        <button onClick={() => editor.chain().focus().deleteColumn().run()}>❌ Col</button>
        <button onClick={() => editor.chain().focus().deleteRow().run()}>❌ Row</button>
        <button onClick={() => editor.chain().focus().deleteTable().run()}>🗑️ Table</button>
        <label className="ml-2 text-sm text-gray-700 cursor-pointer">
          📷 Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) addImage(e.target.files[0]);
            }}
            className="hidden"
          />
        </label>
        <button onClick={() => setShowGraphPopup(true)}>📈 Graph</button>

        {/* 🟢 Sync Status Indicator */}
        <span className="ml-auto text-xs text-gray-500">
          {syncStatus === 'saving' && '🔄 Saving...'}
          {syncStatus === 'success' && <span className="text-green-600">✅ Synced</span>}
          {syncStatus === 'error' && <span className="text-red-600">❌ Sync Failed</span>}
        </span>
      </div>

      {/* Table Popup */}
      {showTablePopup && (
        <div className="popup bg-white border border-gray-300 rounded shadow-md p-4 absolute z-10 left-4 top-20 w-64">
          <h4 className="text-sm font-semibold mb-2">Insert Table</h4>
          <label className="block mb-2 text-sm">
            Rows:
            <input
              type="number"
              min={1}
              value={tableRows}
              onChange={(e) => setTableRows(Number(e.target.value))}
              className="ml-2 border px-2 py-1 text-sm w-16"
            />
          </label>
          <label className="block mb-4 text-sm">
            Columns:
            <input
              type="number"
              min={1}
              value={tableCols}
              onChange={(e) => setTableCols(Number(e.target.value))}
              className="ml-2 border px-2 py-1 text-sm w-16"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button onClick={insertTable} className="bg-blue-500 text-white text-sm px-3 py-1 rounded">Insert</button>
            <button onClick={() => setShowTablePopup(false)} className="text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Graph Modal Portal */}
      {showGraphPopup &&
        ReactDOM.createPortal(
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setShowGraphPopup(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
              <GraphFromTablePopup
                editor={editor}
                onClose={() => setShowGraphPopup(false)}
                onInsert={(img) => {
                  editor.chain().focus().insertContent('<p></p>').setImage({ src: img }).run();
                  setShowGraphPopup(false);
                }}
              />
            </div>
          </>,
          document.body
        )}

      <EditorContent editor={editor} className="editor-content p-4" />
    </div>
  );
};

export default RichEditor;