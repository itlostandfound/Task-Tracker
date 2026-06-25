import { useParams, useNavigate } from 'react-router-dom'
import { useTracker } from '../hooks/useClients'
import { useAppStore } from '../stores/useAppStore'
import { TaskPanel } from '../components/TaskPanel'
import { NotePanel } from '../components/NotePanel'
import { CreateTaskModal } from '../components/CreateTaskModal'
import { EditTaskModal } from '../components/EditTaskModal'
import { NoteEditorModal } from '../components/NoteEditorModal'

export function ClientDetailPage() {
  const { id: clientId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading } = useTracker(clientId || null)
  const { selectedTaskId, editingNoteId } = useAppStore()

  if (isLoading) {
    return <div className="text-slate-400">Loading tracker details...</div>
  }

  if (!client) {
    return <div className="text-slate-400">Tracker not found</div>
  }

  return (
    <>
      <div className="flex flex-col h-full w-full">
        <div className="flex-shrink-0 border-b-2 border-royal-gold/40 pb-3 mb-3 px-2 pt-1">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 px-4 py-1.5 mb-2 rounded-full border border-royal-gold/50 text-royal-gold hover:text-royal-gold-lt hover:border-royal-gold hover:bg-royal-gold/10 hover:shadow-[0_0_14px_rgba(228,168,32,0.3)] transition-all text-sm font-serif tracking-wide"
          >
            <span className="text-base transition-transform group-hover:-translate-x-0.5">⟸</span>
            Return to the Realm
          </button>
          <div className="text-center">
            <span className="text-2xl text-royal-gold/70 drop-shadow-[0_0_10px_rgba(228,168,32,0.4)]">♛</span>
            <h1 className="text-4xl font-serif font-bold gold-gradient tracking-wide">{client.name}</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 min-h-0 w-full">
          <div className="h-1/3 overflow-hidden w-full">
            <TaskPanel clientId={clientId || null} />
          </div>

          <div className="flex-1 overflow-hidden w-full">
            <NotePanel
              clientId={clientId || null}
              selectedTaskId={selectedTaskId}
            />
          </div>
        </div>
      </div>

      <CreateTaskModal clientId={clientId || null} />
      <EditTaskModal clientId={clientId || null} />
      <NoteEditorModal taskId={selectedTaskId} clientId={clientId || null} editingNoteId={editingNoteId} />
    </>
  )
}
