import { useState, useEffect } from 'react'
import { useCreateNote, useUpdateNote, useDeleteNote, useNote } from '../hooks/useClients'
import { useAppStore } from '../stores/useAppStore'
import { ConfirmDialog } from './ConfirmDialog'
import { RichTextEditor } from './RichTextEditor'
import toast from 'react-hot-toast'

interface NoteEditorModalProps {
  taskId: string | null
  clientId: string | null
  editingNoteId?: string | null
}

const EMPTY_DOC = { type: 'doc', content: [] }

// Convert a stored note into TipTap-compatible content, handling the legacy
// plain-text format ({ type: 'doc', text: '...' }) by falling back to content_text.
function toEditorContent(content: unknown, contentText: string | null): unknown {
  if (content && typeof content === 'object' && Array.isArray((content as any).content)) {
    return content
  }
  if (contentText) {
    return {
      type: 'doc',
      content: contentText.split('\n').map((line) => ({
        type: 'paragraph',
        content: line ? [{ type: 'text', text: line }] : [],
      })),
    }
  }
  return EMPTY_DOC
}

export function NoteEditorModal({ taskId, editingNoteId }: NoteEditorModalProps) {
  const { modal, closeModal, setEditingNoteId } = useAppStore()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()
  const { data: noteData } = useNote(editingNoteId || null)

  const [title, setTitle] = useState('')
  const [noteDate, setNoteDate] = useState('')
  const [docJson, setDocJson] = useState<unknown>(EMPTY_DOC)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isOpen = modal.isOpen && (modal.type === 'create_note' || modal.type === 'edit_note')
  const isEditing = !!editingNoteId && !!noteData

  useEffect(() => {
    if (isEditing && noteData) {
      setTitle(noteData.title || '')
      setNoteDate(noteData.note_date || '')
      setDocJson(toEditorContent(noteData.content, noteData.content_text))
    } else {
      setTitle('')
      setNoteDate(new Date().toISOString().split('T')[0])
      setDocJson(EMPTY_DOC)
    }
  }, [isEditing, noteData, isOpen])

  const handleClose = () => {
    setEditingNoteId(null)
    closeModal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!taskId) {
      toast.error('No task selected')
      return
    }

    if (!title.trim()) {
      toast.error('Note title is required')
      return
    }

    const payload = {
      title: title.trim(),
      note_date: noteDate,
      content: (docJson || EMPTY_DOC) as Record<string, unknown>,
    }

    if (isEditing && editingNoteId) {
      updateNote.mutate(
        { id: editingNoteId, payload },
        {
          onSuccess: () => {
            toast.success('Note updated successfully')
            handleClose()
          },
        },
      )
    } else {
      createNote.mutate(
        { taskId, payload },
        {
          onSuccess: () => {
            toast.success('Note created successfully')
            handleClose()
          },
        },
      )
    }
  }

  const handleDelete = async () => {
    if (!editingNoteId) return

    deleteNote.mutate(editingNoteId, {
      onSuccess: () => {
        toast.success('Note deleted successfully')
        handleClose()
      },
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="royal-panel rounded-lg w-[88vw] max-w-5xl h-[88vh] flex flex-col shadow-2xl border-2 border-royal-gold">
          <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-3 border-b-2 border-royal-gold/40">
            <div className="flex items-center gap-3">
              <span className="text-xl text-royal-gold/70">❧</span>
              <h2 className="text-2xl font-serif font-bold gold-gradient">
                {isEditing ? 'Edit Note' : 'Create Note'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-royal-muted hover:text-royal-gold transition text-xl px-2"
              title="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 px-6 py-4 gap-4">
            <div className="flex-shrink-0 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-royal-text mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  autoFocus
                  placeholder="Note title"
                  className="w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold"
                />
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-royal-text mb-1">Date</label>
                <input
                  type="date"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  className="w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text focus:outline-none focus:border-royal-gold"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-sm font-medium text-royal-text mb-1">Content</label>
              <div className="flex-1 min-h-0">
                <RichTextEditor content={docJson} onChange={(json) => setDocJson(json)} />
              </div>
            </div>

            <div className="flex-shrink-0 flex gap-3 justify-between pt-1">
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-800 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded bg-royal-elevated text-royal-text hover:bg-royal-border transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createNote.isPending || updateNote.isPending}
                  className="btn-royal disabled:opacity-50"
                >
                  {createNote.isPending || updateNote.isPending
                    ? 'Saving...'
                    : isEditing
                      ? 'Update'
                      : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
