import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { CodeBlockWithCopy } from './CodeBlockWithCopy';
function ToolbarButton({ onClick, active, disabled, title, children, }) {
    return (_jsx("button", { type: "button", onClick: onClick, disabled: disabled, title: title, className: `min-w-8 h-8 px-2 rounded text-sm font-semibold transition flex items-center justify-center ${active
            ? 'bg-royal-gold text-royal-bg'
            : 'text-royal-text hover:bg-royal-gold/15 hover:text-royal-gold'} disabled:opacity-30 disabled:cursor-not-allowed`, children: children }));
}
function Toolbar({ editor }) {
    const setLink = () => {
        const previous = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL', previous || 'https://');
        if (url === null)
            return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };
    return (_jsxs("div", { className: "flex flex-wrap items-center gap-1 border-b-2 border-royal-gold/40 bg-gradient-to-b from-royal-gold/5 to-transparent p-2", children: [_jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: "Bold", children: _jsx("span", { className: "font-bold", children: "B" }) }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: "Italic", children: _jsx("span", { className: "italic", children: "I" }) }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), title: "Strikethrough", children: _jsx("span", { className: "line-through", children: "S" }) }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code'), title: "Inline code", children: '</>' }), _jsx("div", { className: "w-px h-6 bg-royal-gold/30 mx-1" }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), title: "Heading 1", children: "H1" }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: "Heading 2", children: "H2" }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), title: "Heading 3", children: "H3" }), _jsx("div", { className: "w-px h-6 bg-royal-gold/30 mx-1" }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: "Bullet list", children: "\u2022" }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: "Numbered list", children: "1." }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: "Quote", children: "\u275D" }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), title: "Code block", children: '{ }' }), _jsx("div", { className: "w-px h-6 bg-royal-gold/30 mx-1" }), _jsx(ToolbarButton, { onClick: setLink, active: editor.isActive('link'), title: "Link", children: "\uD83D\uDD17" }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().setHorizontalRule().run(), title: "Divider", children: "\u2015" }), _jsx("div", { className: "w-px h-6 bg-royal-gold/30 mx-1" }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo(), title: "Undo", children: "\u21B6" }), _jsx(ToolbarButton, { onClick: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo(), title: "Redo", children: "\u21B7" })] }));
}
export function RichTextEditor({ content, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Link.configure({ openOnClick: false, autolink: true }),
            CodeBlockWithCopy,
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON(), editor.getText());
        },
        editorProps: {
            attributes: {
                class: 'royal-editor focus:outline-none h-full overflow-y-auto px-4 py-3',
            },
        },
    });
    useEffect(() => {
        if (!editor || content == null)
            return;
        const current = editor.getJSON();
        if (JSON.stringify(current) !== JSON.stringify(content)) {
            editor.commands.setContent(content, false);
        }
    }, [content, editor]);
    if (!editor)
        return null;
    return (_jsxs("div", { className: "flex flex-col h-full border-2 border-royal-gold rounded bg-royal-elevated overflow-hidden", children: [_jsx(Toolbar, { editor: editor }), _jsx("div", { className: "flex-1 min-h-0 overflow-hidden", children: _jsx(EditorContent, { editor: editor, className: "h-full" }) })] }));
}
