import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../api/axios'
import {
  Checklist,
  ChecklistCreate,
  ChecklistUpdate,
  CloneRequest,
  ListResponse,
} from '../types'

export function useChecklists(isTemplate?: boolean, search?: string) {
  return useQuery({
    queryKey: ['checklists', isTemplate, search],
    queryFn: async () => {
      const params: Record<string, unknown> = {}
      if (isTemplate !== undefined) {
        params.is_template = isTemplate
      }
      if (search) {
        params.search = search
      }
      const { data } = await axios.get<ListResponse<Checklist>>('/checklists', { params })
      return data.data
    },
  })
}

export function useChecklist(id: string | null) {
  return useQuery({
    queryKey: ['checklists', id],
    queryFn: async () => {
      const { data } = await axios.get<Checklist>(`/checklists/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateChecklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ChecklistCreate) => {
      const { data } = await axios.post<Checklist>('/checklists', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists'] })
    },
  })
}

export function useUpdateChecklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ChecklistUpdate }) => {
      const { data } = await axios.put<Checklist>(`/checklists/${id}`, payload)
      return data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['checklists'] })
      qc.invalidateQueries({ queryKey: ['checklists', vars.id] })
    },
  })
}

export function useDeleteChecklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/checklists/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists'] })
    },
  })
}

export function useCloneChecklist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ templateId, payload }: { templateId: string; payload: CloneRequest }) => {
      const { data } = await axios.post<Checklist>(`/checklists/${templateId}/clone`, payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists'] })
    },
  })
}

export function useUndoDelete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<Checklist>('/checklists/undo', {})
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists'] })
    },
  })
}
