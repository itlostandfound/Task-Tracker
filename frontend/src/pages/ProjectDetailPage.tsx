import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
  ExternalLink,
  ArrowLeft,
  Pencil,
  X,
  Check,
} from 'lucide-react'
import { useProject, useUpdateProject, useDeleteProject, useAddStep, useUpdateStep, useToggleStepComplete, useReorderSteps, useDeleteStep, useAddReference, useUpdateReference, useDeleteReference } from '../hooks/useProjects'
import { RichTextEditor } from '../components/RichTextEditor'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ProjectStep, ProjectStepReference } from '../types'
import toast from 'react-hot-toast'

// ── Sortable Step Item ────────────────────────────────────────────────────────

interface SortableStepProps {
  step: ProjectStep
  index: number
  isExpanded: boolean
  projectId: string
  onToggleExpand: (id: string) => void
  onToggleComplete: (stepId: string) => void
  onDeleteStep: (stepId: string) => void
  onSaveContent: (stepId: string, content: unknown, text: string) => void
}

function SortableStep({
  step,
  index,
  isExpanded,
  projectId,
  onToggleExpand,
  onToggleComplete,
  onDeleteStep,
  onSaveContent,
}: SortableStepProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const addReference = useAddReference()
  const updateReference = useUpdateReference()
  const deleteReference = useDeleteReference()

  const [refTitle, setRefTitle] = useState('')
  const [refUrl, setRefUrl] = useState('')
  const [refDesc, setRefDesc] = useState('')
  const [showRefForm, setShowRefForm] = useState(false)
  const [editingRefId, setEditingRefId] = useState<string | null>(null)
  const [editRefTitle, setEditRefTitle] = useState('')
  const [editRefUrl, setEditRefUrl] = useState('')
  const [editRefDesc, setEditRefDesc] = useState('')

  const handleAddRef = () => {
    if (!refTitle.trim() || !refUrl.trim()) return
    addReference.mutate(
      { projectId, stepId: step.id, payload: { title: refTitle.trim(), url: refUrl.trim(), description: refDesc.trim() || undefined } },
      {
        onSuccess: () => {
          setRefTitle('')
          setRefUrl('')
          setRefDesc('')
          setShowRefForm(false)
        },
        onError: () => toast.error('Failed to add reference'),
      }
    )
  }

  const startEditRef = (ref: ProjectStepReference) => {
    setEditingRefId(ref.id)
    setEditRefTitle(ref.title)
    setEditRefUrl(ref.url)
    setEditRefDesc(ref.description || '')
  }

  const handleSaveRef = (ref: ProjectStepReference) => {
    updateReference.mutate(
      { projectId, stepId: step.id, refId: ref.id, payload: { title: editRefTitle.trim(), url: editRefUrl.trim(), description: editRefDesc.trim() || undefined } },
      {
        onSuccess: () => setEditingRefId(null),
        onError: () => toast.error('Failed to update reference'),
      }
    )
  }

  const handleDeleteRef = (refId: string) => {
    deleteReference.mutate(
      { projectId, stepId: step.id, refId },
      { onError: () => toast.error('Failed to delete reference') }
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-slate-700 rounded-lg overflow-hidden flex flex-col ${
        isExpanded ? 'flex-1 min-h-0' : 'flex-shrink-0'
      }`}
    >
      {/* Step Header */}
      <div
        className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
          isExpanded ? 'bg-slate-800' : 'bg-slate-900 hover:bg-slate-800/60'
        }`}
        onClick={() => onToggleExpand(step.id)}
      >
        {/* Drag Handle */}
        <span
          {...attributes}
          {...listeners}
          className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </span>

        {/* Chevron */}
        <span className="text-slate-500 flex-shrink-0">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>

        {/* Title */}
        <span className="flex-1 font-medium text-slate-100">
          <span className="text-royal-gold/60 text-sm mr-2">Step {index + 1}:</span>
          {step.title}
        </span>

        {/* Status Badge */}
        <span
          className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded ${
            step.is_completed
              ? 'bg-green-900/50 text-green-400 border border-green-700'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {step.is_completed ? 'Completed' : 'Incomplete'}
        </span>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDeleteStep(step.id)
          }}
          className="flex-shrink-0 p-1.5 rounded text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition"
          title="Delete step"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="flex-1 min-h-0 flex flex-col bg-slate-900/50 border-t border-slate-700 p-4 gap-4 overflow-y-auto">
          {/* TipTap Editor */}
          <div className="flex-1 min-h-[12rem]">
            <RichTextEditor
              content={step.content}
              onChange={(json, text) => onSaveContent(step.id, json, text)}
            />
          </div>

          {/* Completion Toggle */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={step.is_completed}
                onChange={() => onToggleComplete(step.id)}
                className="w-4 h-4 accent-green-500 cursor-pointer"
              />
              <span className="text-sm text-slate-300">
                {step.is_completed ? 'Completed' : 'Mark as Completed'}
              </span>
            </label>
          </div>

          {/* References Section */}
          <div className="flex-shrink-0 border-t border-slate-700/60 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-royal-gold/80 uppercase tracking-wider">
                References
              </h4>
              <button
                onClick={() => setShowRefForm((v) => !v)}
                className="flex items-center gap-1 text-xs text-royal-gold/60 hover:text-royal-gold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Reference
              </button>
            </div>

            {/* Reference List */}
            {step.references.length > 0 && (
              <div className="space-y-2 mb-3">
                {step.references.map((ref) =>
                  editingRefId === ref.id ? (
                    <div key={ref.id} className="bg-slate-800 rounded p-3 space-y-2">
                      <input
                        value={editRefTitle}
                        onChange={(e) => setEditRefTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:border-royal-gold"
                      />
                      <input
                        value={editRefUrl}
                        onChange={(e) => setEditRefUrl(e.target.value)}
                        placeholder="URL"
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:border-royal-gold"
                      />
                      <input
                        value={editRefDesc}
                        onChange={(e) => setEditRefDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:border-royal-gold"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveRef(ref)}
                          className="flex items-center gap-1 px-2 py-1 bg-royal-gold text-slate-950 rounded text-xs font-semibold hover:bg-royal-gold/90 transition"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingRefId(null)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={ref.id} className="flex items-start gap-2 group">
                      <div className="flex-1 min-w-0">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ref.title}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                        {ref.description && (
                          <p className="text-slate-500 text-xs mt-0.5">{ref.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                        <button
                          onClick={() => startEditRef(ref)}
                          className="p-1 rounded text-slate-500 hover:text-royal-gold transition"
                          title="Edit reference"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteRef(ref.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                          title="Delete reference"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {step.references.length === 0 && !showRefForm && (
              <p className="text-slate-600 text-xs italic">No references yet.</p>
            )}

            {/* Add Reference Form */}
            {showRefForm && (
              <div className="bg-slate-800 rounded p-3 space-y-2">
                <input
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                  placeholder="Title *"
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
                />
                <input
                  value={refUrl}
                  onChange={(e) => setRefUrl(e.target.value)}
                  placeholder="URL *"
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
                />
                <input
                  value={refDesc}
                  onChange={(e) => setRefDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddRef}
                    disabled={!refTitle.trim() || !refUrl.trim()}
                    className="flex items-center gap-1 px-2 py-1 bg-royal-gold text-slate-950 rounded text-xs font-semibold hover:bg-royal-gold/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <Check className="w-3 h-3" /> Add
                  </button>
                  <button
                    onClick={() => setShowRefForm(false)}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Project Detail Page ───────────────────────────────────────────────────────

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading } = useProject(id ?? null)
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const addStep = useAddStep()
  const updateStep = useUpdateStep()
  const toggleComplete = useToggleStepComplete()
  const reorderSteps = useReorderSteps()
  const deleteStep = useDeleteStep()

  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [newStepTitle, setNewStepTitle] = useState('')
  const [showAddStep, setShowAddStep] = useState(false)
  const [confirmDeleteStep, setConfirmDeleteStep] = useState<string | null>(null)
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading project...</div>
  }

  if (!project) {
    return (
      <div className="p-8 text-slate-400">
        Project not found.{' '}
        <button onClick={() => navigate('/projects')} className="text-royal-gold hover:underline">
          Back to Projects
        </button>
      </div>
    )
  }

  const steps = [...project.steps].sort((a, b) => a.position - b.position)

  const handleToggleExpand = (stepId: string) => {
    setExpandedStepId((prev) => (prev === stepId ? null : stepId))
  }

  const handleToggleComplete = (stepId: string) => {
    toggleComplete.mutate(
      { projectId: project.id, stepId },
      {
        onSuccess: (updatedStep) => {
          if (updatedStep.is_completed) {
            const next = steps.find((s) => !s.is_completed && s.id !== stepId)
            if (next) setExpandedStepId(next.id)
          }
        },
        onError: () => toast.error('Failed to update step'),
      }
    )
  }

  const handleSaveContent = (stepId: string, content: unknown, text: string) => {
    updateStep.mutate(
      { projectId: project.id, stepId, payload: { content: content as Record<string, unknown>, content_text: text } },
      { onError: () => toast.error('Failed to save content') }
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = steps.findIndex((s) => s.id === active.id)
    const newIndex = steps.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(steps, oldIndex, newIndex)
    reorderSteps.mutate(
      { projectId: project.id, payload: { step_ids: reordered.map((s) => s.id) } },
      { onError: () => toast.error('Failed to reorder steps') }
    )
  }

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return
    addStep.mutate(
      { projectId: project.id, payload: { title: newStepTitle.trim() } },
      {
        onSuccess: (newStep) => {
          setNewStepTitle('')
          setShowAddStep(false)
          setExpandedStepId(newStep.id)
        },
        onError: () => toast.error('Failed to add step'),
      }
    )
  }

  const handleDeleteStep = (stepId: string) => {
    setConfirmDeleteStep(null)
    deleteStep.mutate(
      { projectId: project.id, stepId },
      { onError: () => toast.error('Failed to delete step') }
    )
  }

  const handleStartEditTitle = () => {
    setTitleValue(project.title)
    setEditingTitle(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  const handleSaveTitle = () => {
    const trimmed = titleValue.trim()
    if (!trimmed || trimmed === project.title) {
      setEditingTitle(false)
      return
    }
    updateProject.mutate(
      { id: project.id, payload: { title: trimmed } },
      {
        onSuccess: () => setEditingTitle(false),
        onError: () => toast.error('Failed to rename project'),
      }
    )
  }

  const handleDeleteProject = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => navigate('/projects'),
      onError: () => toast.error('Failed to delete project'),
    })
  }

  const totalSteps = steps.length
  const completedSteps = steps.filter((s) => s.is_completed).length
  const allComplete = totalSteps > 0 && completedSteps === totalSteps

  return (
    <div className="flex flex-col h-full w-full pt-6 pb-4 px-4">
      {/* Back + Delete */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-slate-400 hover:text-royal-gold transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          All Projects
        </button>
        <button
          onClick={() => setConfirmDeleteProject(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-red-400 hover:bg-red-900/20 border border-red-800/50 transition text-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Project
        </button>
      </div>

      {/* Project Title */}
      <div className="flex-shrink-0 mb-2">
        {editingTitle ? (
          <input
            ref={titleInputRef}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle()
              if (e.key === 'Escape') setEditingTitle(false)
            }}
            className="text-4xl font-serif font-bold bg-transparent border-b-2 border-royal-gold text-royal-gold focus:outline-none w-full"
          />
        ) : (
          <h1
            className="text-4xl font-serif font-bold gold-gradient cursor-pointer hover:opacity-80 transition inline-flex items-center gap-3 group"
            onClick={handleStartEditTitle}
            title="Click to rename"
          >
            {project.title}
            <Pencil className="w-5 h-5 text-royal-gold/30 group-hover:text-royal-gold/60 transition" />
          </h1>
        )}
      </div>

      {/* Progress Summary */}
      <div className="flex-shrink-0 flex items-center gap-3 mb-4">
        <span className="text-slate-400 text-sm">
          {totalSteps === 0 ? 'No steps' : `${completedSteps} of ${totalSteps} steps completed`}
        </span>
        {allComplete && (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-900/50 text-green-400 border border-green-700">
            Completed
          </span>
        )}
      </div>

      {/* Steps */}
      {steps.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-700 rounded-lg">
          <p className="text-slate-400 mb-2">No steps yet.</p>
          <p className="text-slate-500 text-sm">Add your first step to get started.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto">
              {steps.map((step, index) => (
                <SortableStep
                  key={step.id}
                  step={step}
                  index={index}
                  isExpanded={expandedStepId === step.id}
                  projectId={project.id}
                  onToggleExpand={handleToggleExpand}
                  onToggleComplete={handleToggleComplete}
                  onDeleteStep={(stepId) => setConfirmDeleteStep(stepId)}
                  onSaveContent={handleSaveContent}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Step */}
      <div className="flex-shrink-0 mt-4">
        {showAddStep ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddStep()
                if (e.key === 'Escape') setShowAddStep(false)
              }}
              placeholder="Step title..."
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold text-sm"
            />
            <button
              onClick={handleAddStep}
              disabled={!newStepTitle.trim()}
              className="px-3 py-2 bg-royal-gold text-slate-950 rounded font-semibold text-sm hover:bg-royal-gold/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddStep(false)}
              className="px-3 py-2 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddStep(true)}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-600 rounded text-slate-400 hover:border-royal-gold hover:text-royal-gold transition text-sm w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        )}
      </div>

      {/* Confirm Delete Step */}
      <ConfirmDialog
        isOpen={!!confirmDeleteStep}
        title="Delete Step"
        message="This will permanently delete this step and its references."
        confirmText="Delete"
        isDangerous
        onConfirm={() => confirmDeleteStep && handleDeleteStep(confirmDeleteStep)}
        onCancel={() => setConfirmDeleteStep(null)}
      />

      {/* Confirm Delete Project */}
      <ConfirmDialog
        isOpen={confirmDeleteProject}
        title="Delete Project"
        message="This will permanently delete the project and all its steps and references. This cannot be undone."
        confirmText="Delete"
        isDangerous
        onConfirm={handleDeleteProject}
        onCancel={() => setConfirmDeleteProject(false)}
      />
    </div>
  )
}
