import { useState, useEffect } from 'react'
import { useUpdateTracker, useTracker } from '../hooks/useClients'
import { useAppStore } from '../stores/useAppStore'
import toast from 'react-hot-toast'

interface EditClientModalProps {
  clientId: string | null
}

export function EditClientModal(_props: EditClientModalProps) {
  const { modal, closeModal, editingClientId, setEditingClientId } = useAppStore()
  const { data: clientData } = useTracker(editingClientId)
  const updateTracker = useUpdateTracker()

  const [name, setName] = useState('')
  const [clientType, setClientType] = useState('')

  const isOpen = modal.isOpen && modal.type === 'edit_client'

  useEffect(() => {
    if (clientData && isOpen) {
      setName(clientData.name)
      setClientType(clientData.client_type)
    }
  }, [clientData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!clientType.trim()) {
      toast.error('Tracker Type is required')
      return
    }

    if (!editingClientId) return

    const payload = {
      name: name.trim(),
      client_type: clientType.trim(),
    }

    updateTracker.mutate(
      { id: editingClientId, payload },
      {
        onSuccess: () => {
          toast.success('Tracker updated successfully')
          closeModal()
          setEditingClientId(null)
        },
      }
    )
  }

  if (!isOpen || !clientData) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-royal-surface rounded-lg p-6 w-full max-w-md shadow-xl border-2 border-royal-gold">
        <h2 className="text-lg font-semibold text-royal-gold mb-4">Edit Tracker</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-royal-text mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold"
              placeholder="Client / Effort / Title Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-royal-text mb-1">Tracker Type</label>
            <input
              type="text"
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              className="w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold"
              placeholder="Enter tracker type"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                closeModal()
                setEditingClientId(null)
              }}
              className="px-4 py-2 rounded bg-royal-elevated text-royal-text hover:bg-royal-border transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTracker.isPending}
              className="btn-royal disabled:opacity-50"
            >
              {updateTracker.isPending ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
