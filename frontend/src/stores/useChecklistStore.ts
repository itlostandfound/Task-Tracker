import { create } from 'zustand'

type ChecklistModalType =
  | 'create_template'
  | 'create_checklist'
  | 'clone'
  | 'rename'
  | 'confirm_delete'
  | 'add_device'
  | 'add_step'
  | null

type ChecklistViewMode = 'my_checklists' | 'templates'

interface ChecklistModalState {
  isOpen: boolean
  type: ChecklistModalType
}

interface ChecklistStore {
  selectedChecklistId: string | null
  expandedItemId: string | null
  viewMode: ChecklistViewMode
  searchQuery: string
  modal: ChecklistModalState
  editingChecklistId: string | null
  setSelectedChecklistId: (id: string | null) => void
  setExpandedItemId: (id: string | null) => void
  setViewMode: (mode: ChecklistViewMode) => void
  setSearchQuery: (query: string) => void
  openModal: (type: ChecklistModalType) => void
  closeModal: () => void
  setEditingChecklistId: (id: string | null) => void
}

export const useChecklistStore = create<ChecklistStore>((set) => ({
  selectedChecklistId: null,
  expandedItemId: null,
  viewMode: 'my_checklists',
  searchQuery: '',
  modal: {
    isOpen: false,
    type: null,
  },
  editingChecklistId: null,
  setSelectedChecklistId: (id) => set({ selectedChecklistId: id }),
  setExpandedItemId: (id) => set({ expandedItemId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  openModal: (type) =>
    set({
      modal: {
        isOpen: true,
        type,
      },
    }),
  closeModal: () =>
    set({
      modal: {
        isOpen: false,
        type: null,
      },
    }),
  setEditingChecklistId: (id) => set({ editingChecklistId: id }),
}))
