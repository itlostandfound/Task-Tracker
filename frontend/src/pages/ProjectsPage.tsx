import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProjects, useDeleteProject } from '../hooks/useProjects'
import { useProjectStore } from '../stores/useProjectStore'
import { Search, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import toast from 'react-hot-toast'

export function ProjectsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openCreateModal } = useProjectStore()

  const [search, setSearch] = useState('')
  const [incompleteOnly, setIncompleteOnly] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    if (location.state?.openCreate) {
      openCreateModal()
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, openCreateModal, navigate, location.pathname])

  const { data: projects = [], isLoading } = useProjects(incompleteOnly, search)
  const deleteProject = useDeleteProject()

  const handleDelete = (id: string) => {
    deleteProject.mutate(id, {
      onSuccess: () => {
        toast.success('Project deleted')
        setDeleteTargetId(null)
      },
      onError: () => {
        toast.error('Failed to delete project')
        setDeleteTargetId(null)
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto pt-6 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold gold-gradient mb-2">Projects</h1>
        <p className="text-slate-400">Step-by-step guides and learning projects</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
          />
        </div>
        <button
          onClick={() => setIncompleteOnly((v) => !v)}
          className={`px-4 py-2 rounded font-medium transition text-sm ${
            incompleteOnly
              ? 'bg-royal-gold text-slate-950'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Incomplete Only
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-slate-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-2">No projects yet.</p>
          <p className="text-slate-500 text-sm">Create a project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const total = project.steps.length
            const completed = project.steps.filter((s) => s.is_completed).length
            const isComplete = total > 0 && completed === total
            const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="royal-panel rounded-lg p-6 hover:border-royal-gold hover:shadow-[0_8px_32px_rgba(228,168,32,0.25)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 mr-3">
                    <h2 className="text-xl font-serif font-bold text-royal-gold drop-shadow-[0_0_8px_rgba(228,168,32,0.2)] truncate">
                      {project.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTargetId(project.id)
                      }}
                      className="p-2 rounded bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-800 transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-400">
                      {total === 0 ? 'No steps' : `${completed} of ${total} steps completed`}
                    </span>
                    {isComplete && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-900/50 text-green-400 border border-green-700">
                        Completed
                      </span>
                    )}
                  </div>
                  {total > 0 && (
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isComplete ? 'bg-green-500' : 'bg-royal-gold'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Project"
        message="This will permanently delete the project and all its steps and references. This cannot be undone."
        confirmText="Delete"
        isDangerous
        onConfirm={() => deleteTargetId && handleDelete(deleteTargetId)}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}
