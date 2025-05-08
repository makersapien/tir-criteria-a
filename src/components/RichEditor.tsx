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

interface Props {
  content: string;
  onChange: (value: string) => void;
}

const RichEditor: React.FC<Props> = ({ content, onChange }) => {
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
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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
      </div>

      {/* Insert Table Popup */}
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

      {/* Graph Popup Portal */}
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

      {/* Editor */}
      <EditorContent editor={editor} className="editor-content p-4" />
    </div>
  );
};

export default RichEditor;
