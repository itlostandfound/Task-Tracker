import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProject } from '../hooks/useProjects'
import { useProjectStore } from '../stores/useProjectStore'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

export function CreateProjectModal() {
  const navigate = useNavigate()
  const { createModalOpen, closeCreateModal } = useProjectStore()
  const createProject = useCreateProject()
  const [title, setTitle] = useState('')

  const handleClose = () => {
    setTitle('')
    closeCreateModal()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Project title is required')
      return
    }
    createProject.mutate(
      { title: title.trim() },
      {
        onSuccess: (project) => {
          handleClose()
          navigate(`/projects/${project.id}`)
        },
        onError: () => toast.error('Failed to create project'),
      }
    )
  }

  if (!createModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-royal-gold">Create Project</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-200 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Set up K3S cluster on multiple machines"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-slate-800 text-slate-200 rounded font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending || !title.trim()}
              className="flex-1 px-4 py-2 bg-royal-gold text-slate-950 rounded font-medium hover:bg-royal-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
