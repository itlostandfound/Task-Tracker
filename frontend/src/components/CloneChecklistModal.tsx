import React, { useState } from 'react'
import { useCloneChecklist, useChecklist } from '../hooks/useChecklists'
import { useChecklistStore } from '../stores/useChecklistStore'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export function CloneChecklistModal() {
  const { modal, closeModal, editingChecklistId } = useChecklistStore()
  const { data: template } = useChecklist(editingChecklistId && modal.type === 'clone' ? editingChecklistId : null)
  const cloneChecklist = useCloneChecklist()

  const isOpen = modal.isOpen && modal.type === 'clone'

  const [checklistName, setChecklistName] = useState('')
  const [deviceList, setDeviceList] = useState('Device-1\nDevice-2\nDevice-3')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!checklistName.trim()) {
      toast.error('Checklist name is required')
      return
    }

    const devices = deviceList
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0)

    if (devices.length === 0) {
      toast.error('At least one device is required')
      return
    }

    if (!editingChecklistId) {
      toast.error('No template selected')
      return
    }

    cloneChecklist.mutate(
      {
        templateId: editingChecklistId,
        payload: {
          checklist_name: checklistName,
          device_list: devices,
        },
      },
      {
        onSuccess: () => {
          toast.success('Template cloned successfully')
          closeModal()
          setChecklistName('')
          setDeviceList('Device-1\nDevice-2\nDevice-3')
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.detail || 'Failed to clone template')
        },
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-royal-gold">Clone Template</h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {template && (
          <p className="text-sm text-slate-400 mb-6">
            Cloning: <span className="text-royal-gold font-medium">{template.name}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">New Checklist Name</label>
            <input
              type="text"
              value={checklistName}
              onChange={(e) => setChecklistName(e.target.value)}
              placeholder="e.g., Q4 Device Upgrades"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold"
              autoFocus
            />
          </div>

          {/* Device List */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Device List (one per line)
            </label>
            <textarea
              value={deviceList}
              onChange={(e) => setDeviceList(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-royal-gold font-mono text-sm"
              placeholder="Device-1&#10;Device-2&#10;Device-3"
            />
            <p className="text-xs text-slate-400 mt-2">Each device will get a copy of all template steps</p>
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
              disabled={cloneChecklist.isPending}
              className="flex-1 px-4 py-2 bg-royal-gold text-slate-950 rounded font-medium hover:bg-royal-gold/90 transition disabled:opacity-50"
            >
              {cloneChecklist.isPending ? 'Cloning...' : 'Clone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
