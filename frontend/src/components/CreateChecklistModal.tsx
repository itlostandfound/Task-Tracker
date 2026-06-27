import { useState } from 'react'
import { useCreateChecklist } from '../hooks/useChecklists'
import { useChecklistStore } from '../stores/useChecklistStore'
import { ChecklistStep, ChecklistItem } from '../types'
import toast from 'react-hot-toast'
import { X, Plus, Trash2 } from 'lucide-react'
import { generateId } from '../utils/id'

export function CreateChecklistModal() {
  const { modal, closeModal } = useChecklistStore()
  const createChecklist = useCreateChecklist()

  const isOpen = modal.isOpen && (modal.type === 'create_template' || modal.type === 'create_checklist')
  const isTemplate = modal.type === 'create_template'

  const [name, setName] = useState('')
  const [steps, setSteps] = useState<ChecklistStep[]>([])
  const [stepName, setStepName] = useState('')
  const [stepType, setStepType] = useState<'text' | 'command'>('text')
  const [stepCommand, setStepCommand] = useState('')
  const [stepDisplayText, setStepDisplayText] = useState('')
  const [stepHideCommand, setStepHideCommand] = useState(false)

  const resetForm = () => {
    setName('')
    setSteps([])
    setStepName('')
    setStepType('text')
    setStepCommand('')
    setStepDisplayText('')
    setStepHideCommand(false)
  }

  const handleAddStep = () => {
    if (!stepName.trim()) {
      toast.error('Step name is required')
      return
    }

    if (stepType === 'command' && !stepCommand.trim()) {
      toast.error('Command is required')
      return
    }

    const newStep: ChecklistStep = {
      id: generateId(),
      name: stepName,
      type: stepType,
      display_text: stepDisplayText || stepName,
      command: stepType === 'command' ? stepCommand : undefined,
      hide_command: stepType === 'command' ? stepHideCommand : undefined,
      is_completed: false,
      completed_at: null,
      order: steps.length,
    }

    setSteps([...steps, newStep])
    setStepName('')
    setStepCommand('')
    setStepDisplayText('')
    setStepType('text')
    setStepHideCommand(false)
  }

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!isTemplate && steps.length === 0) {
      toast.error('At least one step is required for non-template checklists')
      return
    }

    // For templates, create a placeholder item
    const items: ChecklistItem[] = isTemplate
      ? [
          {
            id: generateId(),
            name: 'Device-1',
            order: 0,
            steps: steps,
          },
        ]
      : []

    createChecklist.mutate(
      {
        name,
        is_template: isTemplate,
        items: items.length > 0 ? items : undefined,
      },
      {
        onSuccess: () => {
          toast.success(`${isTemplate ? 'Template' : 'Checklist'} created successfully`)
          resetForm()
          closeModal()
        },
        onError: () => {
          toast.error('Failed to create checklist')
        },
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-royal-gold">
            Create {isTemplate ? 'Template' : 'Checklist'}
          </h2>
          <button onClick={() => { resetForm(); closeModal() }} className="text-slate-400 hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              {isTemplate ? 'Template' : 'Checklist'} Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., F5 Device Upgrade"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
              autoFocus
            />
          </div>

          {/* Steps Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Steps</h3>

            {/* Add Step Form */}
            <div className="space-y-3 mb-4 p-4 bg-slate-800 rounded border border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Step Name</label>
                <input
                  type="text"
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  placeholder="e.g., Backup Device"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Type</label>
                <select
                  value={stepType}
                  onChange={(e) => setStepType(e.target.value as 'text' | 'command')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:border-royal-gold"
                >
                  <option value="text">Text (Instruction)</option>
                  <option value="command">Command</option>
                </select>
              </div>

              {stepType === 'command' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">Command</label>
                    <input
                      type="text"
                      value={stepCommand}
                      onChange={(e) => setStepCommand(e.target.value)}
                      placeholder="e.g., tmsh show sys license | grep Service Check"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">Display Text (Label)</label>
                    <input
                      type="text"
                      value={stepDisplayText}
                      onChange={(e) => setStepDisplayText(e.target.value)}
                      placeholder="e.g., Check License"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={stepHideCommand}
                      onChange={(e) => setStepHideCommand(e.target.checked)}
                      className="accent-royal-gold"
                    />
                    Hide command by default
                  </label>
                </>
              )}

              <button
                type="button"
                onClick={handleAddStep}
                className="w-full px-3 py-2 bg-royal-gold text-slate-950 rounded font-medium hover:bg-royal-gold/90 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {/* Steps List */}
            {steps.length > 0 && (
              <div className="space-y-2 mb-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex justify-between items-start gap-3 p-3 bg-slate-800 rounded border border-slate-700"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-100 break-words">{step.display_text}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {step.type === 'command' ? (
                          <span title={step.command}>Command: {step.command?.substring(0, 50)}...</span>
                        ) : (
                          <span>Text instruction</span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      className="p-2 text-red-400 hover:bg-red-900/40 rounded transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => { resetForm(); closeModal() }}
              className="flex-1 px-4 py-2 bg-slate-800 text-slate-200 rounded font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createChecklist.isPending}
              className="flex-1 px-4 py-2 bg-royal-gold text-slate-950 rounded font-medium hover:bg-royal-gold/90 transition disabled:opacity-50"
            >
              {createChecklist.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
