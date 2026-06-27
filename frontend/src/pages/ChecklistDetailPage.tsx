import React, { useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChecklist, useUpdateChecklist } from '../hooks/useChecklists'
import { useChecklistStore } from '../stores/useChecklistStore'
import { ChecklistStepItem } from '../components/ChecklistStepItem'
import { EditStepModal } from '../components/EditStepModal'
import { ChecklistItem, ChecklistStep } from '../types'
import toast from 'react-hot-toast'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { generateId } from '../utils/id'

export function ChecklistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: checklist, isLoading } = useChecklist(id || null)
  const { data: templateChecklist } = useChecklist(checklist?.template_id || null)
  const updateChecklist = useUpdateChecklist()
  const { expandedItemId, setExpandedItemId } = useChecklistStore()

  const [localItems, setLocalItems] = useState<ChecklistItem[]>([])
  const [editingStep, setEditingStep] = useState<ChecklistStep | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const pendingItemsRef = useRef<ChecklistItem[]>([])
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (checklist?.items) {
      setLocalItems(checklist.items)
    }
  }, [checklist])

  const handleItemClick = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId)
  }

  const handleStepToggle = useCallback(
    (itemId: string, stepId: string) => {
      setLocalItems((prev) => {
        const updatedItems = prev.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              steps: item.steps.map((step) => {
                if (step.id === stepId) {
                  return {
                    ...step,
                    is_completed: !step.is_completed,
                    completed_at: !step.is_completed ? new Date().toISOString() : null,
                  }
                }
                return step
              }),
            }
          }
          return item
        })
        pendingItemsRef.current = updatedItems
        return updatedItems
      })

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        if (id) {
          updateChecklist.mutate(
            { id, payload: { items: pendingItemsRef.current } },
            { onError: () => toast.error('Failed to save') }
          )
        }
      }, 300)
    },
    [id, updateChecklist]
  )

  const handleDeleteStep = (itemId: string, stepId: string) => {
    const updatedItems = localItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          steps: item.steps.filter((s) => s.id !== stepId),
        }
      }
      return item
    })

    setLocalItems(updatedItems)
    if (id) {
      updateChecklist.mutate(
        { id, payload: { items: updatedItems } },
        {
          onSuccess: () => toast.success('Step deleted'),
          onError: () => toast.error('Failed to delete step'),
        }
      )
    }
  }

  const handleEditStep = (itemId: string, step: ChecklistStep) => {
    setEditingStep(step)
    setEditingItemId(itemId)
  }

  const handleSaveEditedStep = (updatedStep: ChecklistStep) => {
    if (!editingItemId) return

    const updatedItems = localItems.map((item) => {
      if (item.id === editingItemId) {
        return {
          ...item,
          steps: item.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
        }
      }
      return item
    })

    setLocalItems(updatedItems)
    setEditingStep(null)
    setEditingItemId(null)

    if (id) {
      updateChecklist.mutate(
        { id, payload: { items: updatedItems } },
        {
          onSuccess: () => toast.success('Step updated'),
          onError: () => toast.error('Failed to update step'),
        }
      )
    }
  }

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Delete this device/item?')) {
      const updatedItems = localItems.filter((i) => i.id !== itemId)
      setLocalItems(updatedItems)
      setExpandedItemId(null)

      if (id) {
        updateChecklist.mutate(
          { id, payload: { items: updatedItems } },
          {
            onSuccess: () => toast.success('Item deleted'),
            onError: () => toast.error('Failed to delete item'),
          }
        )
      }
    }
  }

  const handleAddDevice = () => {
    const deviceName = prompt('Enter device/item name:')
    if (!deviceName) return

    const sourceSteps = templateChecklist?.items?.[0]?.steps ?? localItems[0]?.steps ?? []
    const newItem: ChecklistItem = {
      id: generateId(),
      name: deviceName,
      order: localItems.length,
      steps: sourceSteps.map((step) => ({
        ...step,
        id: generateId(),
        is_completed: false,
        completed_at: null,
      })),
    }

    const updatedItems = [...localItems, newItem]
    setLocalItems(updatedItems)

    if (id) {
      updateChecklist.mutate(
        { id, payload: { items: updatedItems } },
        {
          onSuccess: () => toast.success('Device added'),
          onError: () => toast.error('Failed to add device'),
        }
      )
    }
  }

  const completionStats = localItems.map((item) => {
    const completed = item.steps.filter((s) => s.is_completed).length
    return {
      itemId: item.id,
      completed,
      total: item.steps.length,
    }
  })

  if (isLoading) {
    return <div className="max-w-6xl mx-auto pt-6 text-slate-400">Loading...</div>
  }

  if (!checklist) {
    return (
      <div className="max-w-6xl mx-auto pt-6">
        <p className="text-slate-400">Checklist not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pt-6 pb-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/checklists')}
          className="text-royal-gold hover:text-royal-gold/80 mb-4 flex items-center gap-1"
        >
          ← Back to Checklists
        </button>
        <h1 className="text-4xl font-serif font-bold gold-gradient">{checklist.name}</h1>
        <p className="text-slate-400 mt-2">
          {checklist.is_template ? 'Template' : `${checklist.items?.length || 0} devices`}
        </p>
      </div>

      {/* Items List */}
      <div className="royal-panel rounded-lg p-6 mb-6">
        {localItems.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No items yet</p>
        ) : (
          <div className="space-y-2">
            {localItems.map((item) => {
              const isExpanded = expandedItemId === item.id
              const { completed, total } = completionStats.find((s) => s.itemId === item.id) || {
                completed: 0,
                total: 0,
              }

              return (
                <div key={item.id}>
                  {/* Item Header (Collapsed View) */}
                  <div
                    onClick={() => handleItemClick(item.id)}
                    className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded cursor-pointer transition flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown
                        className={`w-5 h-5 text-royal-gold transition ${isExpanded ? 'rotate-180' : ''}`}
                      />
                      <span className="font-semibold text-slate-100">{item.name}</span>
                    </div>

                    {!isExpanded && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">
                          {completed}/{total} complete
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteItem(item.id)
                          }}
                          className="p-2 rounded hover:bg-red-900/40 text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Item Expanded View */}
                  {isExpanded && (
                    <div className="mt-2 ml-4 p-4 bg-slate-800 border border-slate-700 rounded space-y-3">
                      {item.steps.map((step) => (
                        <ChecklistStepItem
                          key={step.id}
                          step={step}
                          onToggle={() => handleStepToggle(item.id, step.id)}
                          onDelete={() => handleDeleteStep(item.id, step.id)}
                          onEdit={() => handleEditStep(item.id, step)}
                        />
                      ))}

                      {/* Add Step Button */}
                      <button
                        onClick={() => {
                          const newStep: ChecklistStep = {
                            id: generateId(),
                            name: '',
                            type: 'text',
                            display_text: '',
                            is_completed: false,
                            completed_at: null,
                            order: item.steps.length,
                          }
                          handleEditStep(item.id, newStep)
                        }}
                        className="w-full mt-4 py-2 px-3 border border-dashed border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 rounded transition flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Step
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Add Device Button */}
        {!checklist.is_template && (
          <button
            onClick={handleAddDevice}
            className="w-full mt-6 py-2 px-4 border border-dashed border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 rounded transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Device
          </button>
        )}
      </div>

      {/* Completion Report */}
      {localItems.some((item) => item.steps.some((s) => s.is_completed)) && (
        <div className="royal-panel rounded-lg p-6">
          <h2 className="text-xl font-semibold text-royal-gold mb-4">Completion Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400">Device</th>
                  <th className="text-left py-2 px-3 text-slate-400">Step</th>
                  <th className="text-left py-2 px-3 text-slate-400">Completed</th>
                </tr>
              </thead>
              <tbody>
                {localItems.flatMap((item) =>
                  item.steps
                    .filter((step) => step.is_completed)
                    .map((step) => (
                      <tr key={`${item.id}-${step.id}`} className="border-b border-slate-800">
                        <td className="py-2 px-3 text-slate-200">{item.name}</td>
                        <td className="py-2 px-3 text-slate-200">{step.display_text}</td>
                        <td className="py-2 px-3 text-slate-400">
                          {step.completed_at ? new Date(step.completed_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Step Modal */}
      <EditStepModal
        isOpen={editingStep !== null}
        step={editingStep}
        onSave={handleSaveEditedStep}
        onClose={() => {
          setEditingStep(null)
          setEditingItemId(null)
        }}
      />
    </div>
  )
}
