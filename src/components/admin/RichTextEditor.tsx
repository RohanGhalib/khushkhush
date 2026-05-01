"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none p-4 min-h-[150px] focus:outline-none bg-void-black font-sans text-pure-white',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border-2 border-gray-600 focus-within:border-acid-green transition-colors">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-600 bg-[#1A1A1A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-gray-700 transition-colors ${editor.isActive('bold') ? 'text-acid-green' : 'text-pure-white'}`}
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-gray-700 transition-colors ${editor.isActive('italic') ? 'text-acid-green' : 'text-pure-white'}`}
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 hover:bg-gray-700 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-acid-green' : 'text-pure-white'}`}
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 hover:bg-gray-700 transition-colors ${editor.isActive('bulletList') ? 'text-acid-green' : 'text-pure-white'}`}
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 hover:bg-gray-700 transition-colors ${editor.isActive('orderedList') ? 'text-acid-green' : 'text-pure-white'}`}
        >
          <ListOrdered size={18} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
