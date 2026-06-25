import { useState } from 'react'
import { useCreateTask } from '../hooks/useClients'
import { useAppStore } from '../stores/useAppStore'
import toast from 'react-hot-toast'

interface CreateTaskModalProps {
  clientId: string | null
}

export function CreateTaskModal({ clientId: trackerId }: CreateTaskModalProps) {
  const { modal, closeModal } = useAppStore()
  const createTask = useCreateTask()

  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState(10)

  const isOpen = modal.isOpen && modal.type === 'create_task'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Task title is required')
      return
    }

    if (!trackerId) {
      toast.error('No tracker selected')
      return
    }

    createTask.mutate(
      { trackerId, payload: { title: title.trim(), severity } },
      {
        onSuccess: () => {
          toast.success('Task created successfully')
          setTitle('')
          setSeverity(10)
          closeModal()
        },
      },
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-royal-surface rounded-lg p-6 w-full max-w-md shadow-xl border-2 border-royal-gold">
        <h2 className="text-lg font-semibold text-royal-gold mb-4">Create Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-royal-text mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold"
              placeholder="Task title"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-royal-text mb-1">Severity (1-10)</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text focus:outline-none focus:border-royal-gold"
            >
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((sev) => (
                <option key={sev} value={sev}>
                  Severity {sev}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded bg-royal-elevated text-royal-text hover:bg-royal-border transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending}
              className="btn-royal disabled:opacity-50"
            >
              {createTask.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
