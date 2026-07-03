import { create } from 'zustand'

interface ProjectStore {
  createModalOpen: boolean
  openCreateModal: () => void
  closeCreateModal: () => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  createModalOpen: false,
  openCreateModal: () => set({ createModalOpen: true }),
  closeCreateModal: () => set({ createModalOpen: false }),
}))
