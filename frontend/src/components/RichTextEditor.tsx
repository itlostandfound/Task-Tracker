import { useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { CodeBlockWithCopy } from './CodeBlockWithCopy'

interface RichTextEditorProps {
  content: unknown
  onChange: (json: unknown, text: string) => void
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`min-w-8 h-8 px-2 rounded text-sm font-semibold transition flex items-center justify-center ${
        active
          ? 'bg-royal-gold text-royal-bg'
          : 'text-royal-text hover:bg-royal-gold/15 hover:text-royal-gold'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href
    const url = window.prompt('Enter URL', previous || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b-2 border-royal-gold/40 bg-gradient-to-b from-royal-gold/5 to-transparent p-2">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <span className="line-through">S</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
        {'</>'}
      </ToolbarButton>

      <div className="w-px h-6 bg-royal-gold/30 mx-1" />

      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
        H1
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
        H2
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
        H3
      </ToolbarButton>

      <div className="w-px h-6 bg-royal-gold/30 mx-1" />

      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
        •
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
        1.
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
        ❝
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
        {'{ }'}
      </ToolbarButton>

      <div className="w-px h-6 bg-royal-gold/30 mx-1" />

      <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link">
        🔗
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
        ―
      </ToolbarButton>

      <div className="w-px h-6 bg-royal-gold/30 mx-1" />

      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        ↶
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        ↷
      </ToolbarButton>
    </div>
  )
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      CodeBlockWithCopy,
    ],
    content: (content as any) || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getText())
    },
    editorProps: {
      attributes: {
        class: 'royal-editor focus:outline-none h-full overflow-y-auto px-4 py-3',
      },
    },
  })

  useEffect(() => {
    if (!editor || content == null) return
    const current = editor.getJSON()
    if (JSON.stringify(current) !== JSON.stringify(content)) {
      editor.commands.setContent(content as any, false)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="flex flex-col h-full border-2 border-royal-gold rounded bg-royal-elevated overflow-hidden">
      <Toolbar editor={editor} />
      <div className="flex-1 min-h-0 overflow-hidden">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
