import React, { useState, useEffect } from 'react'
import { useUpdateChecklist, useChecklist } from '../hooks/useChecklists'
import { useChecklistStore } from '../stores/useChecklistStore'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export function RenameChecklistModal() {
  const { modal, closeModal, editingChecklistId } = useChecklistStore()
  const { data: checklist } = useChecklist(editingChecklistId && modal.type === 'rename' ? editingChecklistId : null)
  const updateChecklist = useUpdateChecklist()

  const isOpen = modal.isOpen && modal.type === 'rename'

  const [name, setName] = useState('')

  useEffect(() => {
    if (checklist) {
      setName(checklist.name)
    }
  }, [checklist])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!editingChecklistId) {
      toast.error('No checklist selected')
      return
    }

    updateChecklist.mutate(
      {
        id: editingChecklistId,
        payload: { name },
      },
      {
        onSuccess: () => {
          toast.success('Renamed successfully')
          closeModal()
          setName('')
        },
        onError: () => {
          toast.error('Failed to rename')
        },
      }
    )
  }

  if (!isOpen || !checklist) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-royal-gold">Rename Checklist</h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">New Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter new name"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 bg-slate-800 text-slate-200 rounded font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateChecklist.isPending}
              className="flex-1 px-4 py-2 bg-royal-gold text-slate-950 rounded font-medium hover:bg-royal-gold/90 transition disabled:opacity-50"
            >
              {updateChecklist.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
