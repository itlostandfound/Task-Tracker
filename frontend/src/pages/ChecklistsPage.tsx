import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChecklists, useDeleteChecklist } from '../hooks/useChecklists'
import { useChecklistStore } from '../stores/useChecklistStore'
import toast from 'react-hot-toast'
import { Search, Plus, Copy, Edit2, Trash2 } from 'lucide-react'

export function ChecklistsPage() {
  const navigate = useNavigate()
  const { viewMode, searchQuery, setViewMode, setSearchQuery, openModal, setEditingChecklistId } =
    useChecklistStore()

  const isTemplate = viewMode === 'templates'
  const { data: checklists = [], isLoading } = useChecklists(isTemplate, searchQuery)
  const deleteChecklist = useDeleteChecklist()

  const filteredChecklists = useMemo(() => {
    if (!searchQuery) return checklists
    const query = searchQuery.toLowerCase()
    return checklists.filter((c) => c.name.toLowerCase().includes(query))
  }, [checklists, searchQuery])

  const handleChecklistClick = (checklistId: string) => {
    navigate(`/checklists/${checklistId}`)
  }

  const handleEdit = (e: React.MouseEvent, checklistId: string) => {
    e.stopPropagation()
    setEditingChecklistId(checklistId)
    openModal('rename')
  }

  const handleDelete = (e: React.MouseEvent, checklistId: string) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this? This cannot be undone.')) {
      deleteChecklist.mutate(checklistId, {
        onSuccess: () => {
          toast.success('Deleted successfully')
        },
        onError: () => {
          toast.error('Failed to delete')
        },
      })
    }
  }

  const handleClone = (e: React.MouseEvent, checklistId: string) => {
    e.stopPropagation()
    setEditingChecklistId(checklistId)
    openModal('clone')
  }

  const countItemsAndSteps = (checklist: any) => {
    const itemCount = checklist.items?.length || 0
    const stepCount = checklist.items?.reduce((sum: number, item: any) => sum + (item.steps?.length || 0), 0) || 0
    return { itemCount, stepCount }
  }

  return (
    <div className="max-w-6xl mx-auto pt-6 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold gold-gradient mb-2">Checklists</h1>
        <p className="text-slate-400">Manage your reusable checklist templates and instances</p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('my_checklists')}
            className={`px-4 py-2 rounded font-medium transition ${
              viewMode === 'my_checklists'
                ? 'bg-royal-gold text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            My Checklists
          </button>
          <button
            onClick={() => setViewMode('templates')}
            className={`px-4 py-2 rounded font-medium transition ${
              viewMode === 'templates'
                ? 'bg-royal-gold text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Search & Create */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
            />
          </div>
          <button
            onClick={() => openModal(viewMode === 'templates' ? 'create_template' : 'create_checklist')}
            className="flex items-center gap-2 px-4 py-2 bg-royal-gold text-slate-950 rounded font-medium hover:bg-royal-gold/90 transition"
          >
            <Plus className="w-5 h-5" />
            {viewMode === 'templates' ? 'Create Template' : 'Create Checklist'}
          </button>
        </div>
      </div>

      {/* Checklists Grid */}
      {isLoading ? (
        <div className="text-slate-400">Loading {viewMode === 'templates' ? 'templates' : 'checklists'}...</div>
      ) : filteredChecklists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-6">
            No {viewMode === 'templates' ? 'templates' : 'checklists'} yet.{' '}
            {viewMode === 'templates'
              ? 'Create a template to get started.'
              : 'Clone a template or create one from scratch.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChecklists.map((checklist) => {
            const { itemCount, stepCount } = countItemsAndSteps(checklist)
            return (
              <div
                key={checklist.id}
                onClick={() => handleChecklistClick(checklist.id)}
                className="royal-panel rounded-lg p-6 hover:border-royal-gold hover:shadow-[0_8px_32px_rgba(228,168,32,0.25)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-royal-gold drop-shadow-[0_0_8px_rgba(228,168,32,0.2)]">
                      {checklist.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(checklist.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {!checklist.is_template && (
                      <button
                        onClick={(e) => handleEdit(e, checklist.id)}
                        className="p-2 rounded bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 border border-royal-gold/40 transition"
                        title="Rename"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {checklist.is_template && (
                      <button
                        onClick={(e) => handleClone(e, checklist.id)}
                        className="p-2 rounded bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 border border-royal-gold/40 transition"
                        title="Clone template"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, checklist.id)}
                      className="p-2 rounded bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded text-sm font-medium bg-royal-border text-royal-muted">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="px-3 py-1 rounded text-sm font-medium bg-royal-border text-royal-muted">
                    {stepCount} {stepCount === 1 ? 'step' : 'steps'}
                  </span>
                  {checklist.is_template && (
                    <span className="px-3 py-1 rounded text-sm font-medium bg-blue-900/40 text-blue-300">
                      Template
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals will be imported and rendered by Layout or parent router */}
    </div>
  )
}
