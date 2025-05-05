// src/components/RichEditor.tsx
import React, { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import './RichEditor.css';

interface Props {
  content: string;
  onChange: (value: string) => void;
}

const RichEditor: React.FC<Props> = ({ content, onChange }) => {
  const [showTablePopup, setShowTablePopup] = useState(false);
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
      editor?.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({
      rows: tableRows,
      cols: tableCols,
      withHeaderRow: true
    }).run();
    setShowTablePopup(false);
  };

  if (!editor) return null;

  return (
    <div className="editor-wrapper relative border rounded-md overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="editor-toolbar bg-gray-100 px-4 py-2 border-b border-gray-300 flex flex-wrap gap-2 items-center">
        <button onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" className="font-bold px-2">B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" className="italic px-2">I</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List" className="px-2">• List</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2" className="px-2">H2</button>
        <button onClick={() => setShowTablePopup(true)} className="px-2 text-blue-600" title="Insert Table">➕ Table</button>
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
      </div>

      {/* Table popup */}
      {showTablePopup && (
        <div className="popup bg-white border border-gray-300 rounded shadow-md p-4 absolute z-10 left-4 top-16 w-64">
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

      {/* Editor */}
      <EditorContent editor={editor} className="editor-content p-4" />
    </div>
  );
};

export default RichEditor;
