import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../api/axios'
import {
  Tracker,
  TrackerCreate,
  TrackerUpdate,
  Task,
  TaskCreate,
  TaskUpdate,
  Note,
  NoteCreate,
  NoteUpdate,
  ListResponse,
} from '../types'

// Trackers
export function useTrackers() {
  return useQuery({
    queryKey: ['trackers'],
    queryFn: async () => {
      const { data } = await axios.get<ListResponse<Tracker>>('/trackers')
      return data.data
    },
  })
}

export function useTracker(id: string | null) {
  return useQuery({
    queryKey: ['trackers', id],
    queryFn: async () => {
      const { data } = await axios.get<Tracker>(`/trackers/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTracker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: TrackerCreate) => {
      const { data } = await axios.post<Tracker>('/trackers', payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trackers'] }),
  })
}

export function useUpdateTracker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: TrackerUpdate }) => {
      const { data } = await axios.patch<Tracker>(`/trackers/${id}`, payload)
      return data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['trackers'] })
      qc.invalidateQueries({ queryKey: ['trackers', vars.id] })
    },
  })
}

export function useDeleteTracker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/trackers/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trackers'] }),
  })
}

// Tasks
export function useTasks(trackerId: string | null, includeCompleted = false) {
  return useQuery({
    queryKey: ['tasks', trackerId, includeCompleted],
    queryFn: async () => {
      const { data } = await axios.get<ListResponse<Task>>(`/trackers/${trackerId}/tasks`, {
        params: { include_completed: includeCompleted },
      })
      return data.data
    },
    enabled: !!trackerId,
  })
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data } = await axios.get<Task>(`/tasks/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ trackerId, payload }: { trackerId: string; payload: TaskCreate }) => {
      const { data } = await axios.post<Task>(`/trackers/${trackerId}/tasks`, payload)
      return data
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['tasks', vars.trackerId] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: TaskUpdate }) => {
      const { data } = await axios.patch<Task>(`/tasks/${id}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/tasks/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

// Notes
export function useNotes(taskId: string | null) {
  return useQuery({
    queryKey: ['notes', taskId],
    queryFn: async () => {
      const { data } = await axios.get<ListResponse<Note>>(`/tasks/${taskId}/notes`)
      return data.data
    },
    enabled: !!taskId,
  })
}

export function useNote(id: string | null) {
  return useQuery({
    queryKey: ['notes', id],
    queryFn: async () => {
      const { data } = await axios.get<Note>(`/notes/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, payload }: { taskId: string; payload: NoteCreate }) => {
      const { data } = await axios.post<Note>(`/tasks/${taskId}/notes`, payload)
      return data
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['notes', vars.taskId] }),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: NoteUpdate }) => {
      const { data } = await axios.patch<Note>(`/notes/${id}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/notes/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })
}
