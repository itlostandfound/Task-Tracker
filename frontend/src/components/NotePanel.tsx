import { useMemo } from 'react'
import { useNotes } from '../hooks/useClients'
import { useAppStore } from '../stores/useAppStore'
import toast from 'react-hot-toast'

interface NotePanelProps {
  clientId: string | null
  selectedTaskId: string | null
}

export function NotePanel({ selectedTaskId }: NotePanelProps) {
  const { openModal, setEditingNoteId } = useAppStore()
  const { data: notes = [], isLoading } = useNotes(selectedTaskId)

  const sortedNotes = useMemo(() => {
    return [...notes].sort(
      (a, b) => new Date(b.note_date).getTime() - new Date(a.note_date).getTime(),
    )
  }, [notes])

  const handleEditNote = (noteId: string) => {
    setEditingNoteId(noteId)
    openModal('edit_note')
  }

  return (
    <div className="flex flex-col h-full royal-panel rounded-lg">
      <div className="flex-shrink-0 border-b-2 border-royal-gold/40 p-4 bg-gradient-to-b from-royal-gold/5 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-royal-gold/70">❧</span>
          <button
            onClick={() => {
              if (selectedTaskId) {
                openModal('create_note')
              } else {
                toast.error('Select a task first to add a note')
              }
            }}
            className="btn-royal text-sm"
          >
            + Create Note
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedTaskId ? (
          <div className="p-4 text-royal-muted text-sm italic">Select a task above to view or add its notes</div>
        ) : isLoading ? (
          <div className="p-4 text-royal-muted text-sm">Loading notes...</div>
        ) : sortedNotes.length === 0 ? (
          <div className="p-4 text-royal-muted text-sm">No notes yet</div>
        ) : (
          <div className="divide-y divide-royal-border">
            {sortedNotes.map((note) => {
              const preview = note.content_text
                ?.split('\n')
                .slice(0, 2)
                .join('\n')
                .substring(0, 100) || '(empty)'

              return (
                <div
                  key={note.id}
                  onClick={() => handleEditNote(note.id)}
                  className="p-3 cursor-pointer hover:bg-royal-elevated transition"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <h3 className="text-base font-serif font-bold text-royal-gold truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    <span className="flex-shrink-0 text-xs text-royal-muted">
                      {new Date(note.note_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-royal-text/60 line-clamp-1">{preview}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
