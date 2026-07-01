import { useState, useEffect } from 'react'
import { ChecklistStep } from '../types'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

interface EditStepModalProps {
  isOpen: boolean
  step: ChecklistStep | null
  onSave: (step: ChecklistStep) => void
  onClose: () => void
}

export function EditStepModal({ isOpen, step, onSave, onClose }: EditStepModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'text' | 'command'>('text')
  const [displayText, setDisplayText] = useState('')
  const [instructionText, setInstructionText] = useState('')
  const [command, setCommand] = useState('')
  const [hideCommand, setHideCommand] = useState(false)

  useEffect(() => {
    if (step) {
      setName(step.name)
      setType(step.type)
      setDisplayText(step.display_text || step.name)
      setInstructionText(step.instruction_text || '')
      setCommand(step.command || '')
      setHideCommand(step.hide_command || false)
    }
  }, [step, isOpen])

  const resetForm = () => {
    setName('')
    setType('text')
    setDisplayText('')
    setInstructionText('')
    setCommand('')
    setHideCommand(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Step name is required')
      return
    }

    if (type === 'command' && !command.trim()) {
      toast.error('Command is required for command type')
      return
    }

    if (type === 'command' && hideCommand && !displayText.trim()) {
      toast.error('Display text is required when hiding the command')
      return
    }

    if (!step) return

    const updatedStep: ChecklistStep = {
      ...step,
      name,
      type,
      display_text: displayText || name,
      instruction_text: type === 'text' ? instructionText : undefined,
      command: type === 'command' ? command : undefined,
      hide_command: type === 'command' ? hideCommand : undefined,
    }

    onSave(updatedStep)
    resetForm()
    onClose()
    toast.success('Step updated')
  }

  if (!isOpen || !step) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-royal-gold">Edit Step</h2>
          <button onClick={() => { resetForm(); onClose() }} className="text-slate-400 hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Name */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Step Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Backup Device"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
              autoFocus
            />
          </div>

          {/* Step Type */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'text' | 'command')}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-royal-gold"
            >
              <option value="text">Text (Instruction)</option>
              <option value="command">Command</option>
            </select>
          </div>

          {/* Display Text */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              {type === 'command' ? 'Display Text (shown when command is hidden)' : 'Description'}
            </label>
            <input
              type="text"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              placeholder={type === 'command' ? 'e.g., Show system license' : 'Step description'}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
            />
            {type === 'command' && (
              <p className="text-xs text-slate-400 mt-2">
                When "Hide command" is checked, this text will be shown instead of the command
              </p>
            )}
          </div>

          {/* Instruction Text (only for text type) */}
          {type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Instruction Text</label>
              <textarea
                value={instructionText}
                onChange={(e) => setInstructionText(e.target.value)}
                placeholder="Enter the full text instruction here..."
                rows={4}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold resize-y text-sm"
              />
            </div>
          )}

          {/* Command (only show if type is command) */}
          {type === 'command' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Command</label>
                <textarea
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="e.g., tmsh show sys license | grep Service Check"
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold font-mono text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={hideCommand}
                  onChange={(e) => setHideCommand(e.target.checked)}
                  className="accent-royal-gold"
                />
                Hide command by default (show as dots)
              </label>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => { resetForm(); onClose() }}
              className="flex-1 px-4 py-2 bg-slate-800 text-slate-200 rounded font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-royal-gold text-slate-950 rounded font-medium hover:bg-royal-gold/90 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
