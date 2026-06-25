import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';
import CodeBlock from '@tiptap/extension-code-block';
function CodeBlockView({ node }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(node.textContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch {
            setCopied(false);
        }
    };
    return (_jsxs(NodeViewWrapper, { className: "relative group", children: [_jsx("button", { type: "button", contentEditable: false, onMouseDown: (e) => e.preventDefault(), onClick: handleCopy, title: "Copy code", className: `absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold border transition select-none ${copied
                    ? 'bg-royal-gold text-royal-bg border-royal-gold'
                    : 'bg-royal-surface/80 text-royal-gold/70 border-royal-gold/30 opacity-0 group-hover:opacity-100 hover:text-royal-gold hover:border-royal-gold'}`, children: copied ? '✓ Copied' : 'Copy' }), _jsx("pre", { children: _jsx(NodeViewContent, { as: "code" }) })] }));
}
export const CodeBlockWithCopy = CodeBlock.extend({
    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockView);
    },
});
