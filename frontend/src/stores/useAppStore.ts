import { create } from 'zustand'

interface ModalState {
  isOpen: boolean
  type: 'create_client' | 'edit_client' | 'create_task' | 'edit_task' | 'create_device' | 'edit_device' | 'create_note' | 'edit_note' | null
}

interface AppStore {
  selectedClientId: string | null
  selectedTaskId: string | null
  editingClientId: string | null
  editingTaskId: string | null
  showCompletedTasks: boolean
  modal: ModalState
  editingNoteId: string | null
  setSelectedClientId: (id: string | null) => void
  setSelectedTaskId: (id: string | null) => void
  setEditingClientId: (id: string | null) => void
  setEditingTaskId: (id: string | null) => void
  setShowCompletedTasks: (show: boolean) => void
  openModal: (type: ModalState['type']) => void
  closeModal: () => void
  setEditingNoteId: (id: string | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
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
}))
