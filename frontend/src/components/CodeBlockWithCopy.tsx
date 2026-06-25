import { useState } from 'react'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import CodeBlock from '@tiptap/extension-code-block'

function CodeBlockView({ node }: NodeViewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(node.textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <NodeViewWrapper className="relative group">
      <button
        type="button"
        contentEditable={false}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleCopy}
        title="Copy code"
        className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold border transition select-none ${
          copied
            ? 'bg-royal-gold text-royal-bg border-royal-gold'
            : 'bg-royal-surface/80 text-royal-gold/70 border-royal-gold/30 opacity-0 group-hover:opacity-100 hover:text-royal-gold hover:border-royal-gold'
        }`}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

export const CodeBlockWithCopy = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView)
  },
})
