import { useState, useEffect } from 'react'
import { ChecklistStep } from '../types'
import { Copy, Trash2, Eye, EyeOff, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ChecklistStepItemProps {
  step: ChecklistStep
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
}

export function ChecklistStepItem({ step, onToggle, onDelete, onEdit }: ChecklistStepItemProps) {
  const [showCommand, setShowCommand] = useState(!step.hide_command)

  // Update showCommand when step.hide_command changes
  useEffect(() => {
    setShowCommand(!step.hide_command)
  }, [step.hide_command])

  const handleCopyCommand = () => {
    if (step.command) {
      navigator.clipboard.writeText(step.command)
      toast.success('Copied to clipboard')
    }
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded border border-slate-600 hover:border-slate-500 transition">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={step.is_completed}
        onChange={onToggle}
        className="mt-1 w-5 h-5 accent-royal-gold cursor-pointer"
      />

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${step.is_completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
            {step.display_text}
          </span>
          {step.type === 'command' && (
            <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded">Command</span>
          )}
        </div>

        {/* Instruction Text Display */}
        {step.type === 'text' && step.instruction_text && (
          <p className="mt-1 text-sm text-slate-400 whitespace-pre-wrap">{step.instruction_text}</p>
        )}

        {/* Command Display */}
        {step.type === 'command' && step.command && (
          <div className="mt-2 text-xs">
            <div
              className="flex items-center justify-between p-2 bg-slate-800 border border-slate-700 rounded font-mono text-slate-300 break-all"
              title={step.command}
            >
              <span className={`flex-1 overflow-hidden ${!showCommand ? 'font-normal not-italic' : ''}`}>
                {showCommand ? step.command : step.display_text}
              </span>
              <div className="flex gap-1 ml-2 flex-shrink-0">
                <button
                  onClick={() => setShowCommand(!showCommand)}
                  className="p-1 hover:bg-slate-700 rounded transition"
                  title={showCommand ? 'Hide' : 'Show'}
                >
                  {showCommand ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCopyCommand}
                  className="p-1 hover:bg-slate-700 rounded transition text-royal-gold hover:text-royal-gold/80"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 text-royal-gold hover:bg-royal-gold/20 rounded transition"
          title="Edit step"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-red-400 hover:bg-red-900/40 rounded transition"
          title="Delete step"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
