import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useNotes } from '../hooks/useClients';
import { useAppStore } from '../stores/useAppStore';
import toast from 'react-hot-toast';
export function NotePanel({ selectedTaskId }) {
    const { openModal, setEditingNoteId } = useAppStore();
    const { data: notes = [], isLoading } = useNotes(selectedTaskId);
    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => new Date(b.note_date).getTime() - new Date(a.note_date).getTime());
    }, [notes]);
    const handleEditNote = (noteId) => {
        setEditingNoteId(noteId);
        openModal('edit_note');
    };
    return (_jsxs("div", { className: "flex flex-col h-full royal-panel rounded-lg", children: [_jsx("div", { className: "flex-shrink-0 border-b-2 border-royal-gold/40 p-4 bg-gradient-to-b from-royal-gold/5 to-transparent", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-royal-gold/70", children: "\u2767" }), _jsx("button", { onClick: () => {
                                if (selectedTaskId) {
                                    openModal('create_note');
                                }
                                else {
                                    toast.error('Select a task first to add a note');
                                }
                            }, className: "btn-royal text-sm", children: "+ Create Note" })] }) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: !selectedTaskId ? (_jsx("div", { className: "p-4 text-royal-muted text-sm italic", children: "Select a task above to view or add its notes" })) : isLoading ? (_jsx("div", { className: "p-4 text-royal-muted text-sm", children: "Loading notes..." })) : sortedNotes.length === 0 ? (_jsx("div", { className: "p-4 text-royal-muted text-sm", children: "No notes yet" })) : (_jsx("div", { className: "divide-y divide-royal-border", children: sortedNotes.map((note) => {
                        const preview = note.content_text
                            ?.split('\n')
                            .slice(0, 2)
                            .join('\n')
                            .substring(0, 100) || '(empty)';
                        return (_jsxs("div", { onClick: () => handleEditNote(note.id), className: "p-3 cursor-pointer hover:bg-royal-elevated transition", children: [_jsxs("div", { className: "flex items-baseline justify-between gap-3 mb-1", children: [_jsx("h3", { className: "text-base font-serif font-bold text-royal-gold truncate", children: note.title || 'Untitled' }), _jsx("span", { className: "flex-shrink-0 text-xs text-royal-muted", children: new Date(note.note_date).toLocaleDateString() })] }), _jsx("p", { className: "text-xs text-royal-text/60 line-clamp-1", children: preview })] }, note.id));
                    }) })) })] }));
}
