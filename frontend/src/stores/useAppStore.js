import { create } from 'zustand';
export const useAppStore = create((set) => ({
    selectedClientId: null,
    selectedTaskId: null,
    editingClientId: null,
    editingTaskId: null,
    showCompletedTasks: false,
    modal: {
        isOpen: false,
        type: null,
    },
    editingNoteId: null,
    setSelectedClientId: (id) => set({ selectedClientId: id }),
    setSelectedTaskId: (id) => set({ selectedTaskId: id }),
    setEditingClientId: (id) => set({ editingClientId: id }),
    setEditingTaskId: (id) => set({ editingTaskId: id }),
    setShowCompletedTasks: (show) => set({ showCompletedTasks: show }),
    openModal: (type) => set({
        modal: {
            isOpen: true,
            type,
        },
    }),
    closeModal: () => set({
        modal: {
            isOpen: false,
            type: null,
        },
    }),
    setEditingNoteId: (id) => set({ editingNoteId: id }),
}));
