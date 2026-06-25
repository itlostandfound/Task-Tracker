import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrackers, useDeleteTracker } from '../hooks/useClients'
import { useAppStore } from '../stores/useAppStore'
import { CreateClientModal } from '../components/CreateClientModal'
import { EditClientModal } from '../components/EditClientModal'
import toast from 'react-hot-toast'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: clients = [], isLoading } = useTrackers()
  const { setSelectedClientId, openModal, setEditingClientId } = useAppStore()
  const deleteTracker = useDeleteTracker()

  const handleClientClick = (trackerId: string) => {
    setSelectedClientId(trackerId)
    navigate(`/trackers/${trackerId}`)
  }

  const handleEditClient = (e: React.MouseEvent, trackerId: string) => {
    e.stopPropagation()
    setEditingClientId(trackerId)
    openModal('edit_client')
  }

  const handleDeleteClient = (e: React.MouseEvent, trackerId: string) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this tracker?')) {
      deleteTracker.mutate(trackerId, {
        onSuccess: () => {
          toast.success('Tracker deleted successfully')
        },
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-indigo-900 text-indigo-300'
      case 'fixed_fee':
        return 'bg-emerald-900 text-emerald-300'
      case 'AO':
        return 'bg-purple-900 text-purple-300'
      default:
        return 'bg-slate-700 text-slate-300'
    }
  }

  return (
    <>
      <div className="max-w-6xl mx-auto pt-6">
        <div className="text-center mb-12">
          <span className="text-5xl text-royal-gold drop-shadow-[0_0_16px_rgba(228,168,32,0.5)]">♔</span>
          <h1 className="text-5xl font-serif font-bold gold-gradient mt-4 tracking-wide">Royal Dashboard</h1>
          <div className="flourish my-3 max-w-xs mx-auto"><span>⚜</span></div>
          <p className="text-sm text-royal-gold/60 italic font-serif tracking-wide">Manage Your Realm</p>
        </div>

        {isLoading ? (
          <div className="text-slate-400">Loading trackers...</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-6">No Trackers yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleClientClick(client.id)}
                className="royal-panel rounded-lg p-6 hover:border-royal-gold hover:shadow-[0_8px_32px_rgba(228,168,32,0.25)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-serif font-bold text-royal-gold drop-shadow-[0_0_8px_rgba(228,168,32,0.2)]">{client.name}</h2>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleEditClient(e, client.id)}
                      className="p-2 rounded bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 border border-royal-gold/40 transition"
                      title="Edit tracker"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => handleDeleteClient(e, client.id)}
                      className="p-2 rounded bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-800 transition"
                      title="Delete tracker"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getTypeColor(client.client_type)}`}>
                    {client.client_type.replace('_', ' ')}
                  </span>

                  {client.open_task_count > 0 && (
                    <span className="px-3 py-1 rounded text-sm font-medium bg-royal-border text-royal-muted">
                      {client.open_task_count} open task{client.open_task_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateClientModal />
      <EditClientModal clientId={null} />
    </>
  )
}
