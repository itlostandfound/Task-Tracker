import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../api/axios'
import {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectStep,
  ProjectStepCreate,
  ProjectStepUpdate,
  ProjectStepReference,
  ProjectStepReferenceCreate,
  ProjectStepReferenceUpdate,
  StepReorderRequest,
  ListResponse,
} from '../types'

export function useProjects(incomplete?: boolean, search?: string) {
  return useQuery({
    queryKey: ['projects', incomplete, search],
    queryFn: async () => {
      const params: Record<string, unknown> = {}
      if (incomplete) params.incomplete = true
      if (search) params.search = search
      const { data } = await axios.get<ListResponse<Project>>('/projects', { params })
      return data.data
    },
  })
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data } = await axios.get<Project>(`/projects/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ProjectCreate) => {
      const { data } = await axios.post<Project>('/projects', payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ProjectUpdate }) => {
      const { data } = await axios.patch<Project>(`/projects/${id}`, payload)
      return data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', vars.id] })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/projects/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useAddStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, payload }: { projectId: string; payload: ProjectStepCreate }) => {
      const { data } = await axios.post<ProjectStep>(`/projects/${projectId}/steps`, payload)
      return data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects', vars.projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      stepId,
      payload,
    }: {
      projectId: string
      stepId: string
      payload: ProjectStepUpdate
    }) => {
      const { data } = await axios.patch<ProjectStep>(`/projects/${projectId}/steps/${stepId}`, payload)
      return data
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['projects', vars.projectId] }),
  })
}

export function useToggleStepComplete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, stepId }: { projectId: string; stepId: string }) => {
      const { data } = await axios.patch<ProjectStep>(
        `/projects/${projectId}/steps/${stepId}/complete`,
        {}
      )
      return data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects', vars.projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useReorderSteps() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, payload }: { projectId: string; payload: StepReorderRequest }) => {
      const { data } = await axios.patch<ProjectStep[]>(
        `/projects/${projectId}/steps/reorder`,
        payload
      )
      return data
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['projects', vars.projectId] }),
  })
}

export function useDeleteStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, stepId }: { projectId: string; stepId: string }) => {
      await axios.delete(`/projects/${projectId}/steps/${stepId}`)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects', vars.projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useAddReference() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      stepId,
      payload,
    }: {
      projectId: string
      stepId: string
      payload: ProjectStepReferenceCreate
    }) => {
      const { data } = await axios.post<ProjectStepReference>(
        `/projects/${projectId}/steps/${stepId}/references`,
        payload
      )
      return data
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['projects', vars.projectId] }),
  })
}

export function useUpdateReference() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      stepId,
      refId,
      payload,
    }: {
      projectId: string
      stepId: string
      refId: string
      payload: ProjectStepReferenceUpdate
    }) => {
      const { data } = await axios.patch<ProjectStepReference>(
        `/projects/${projectId}/steps/${stepId}/references/${refId}`,
        payload
      )
      return data
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['projects', vars.projectId] }),
  })
}

export function useDeleteReference() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      stepId,
      refId,
    }: {
      projectId: string
      stepId: string
      refId: string
    }) => {
      await axios.delete(`/projects/${projectId}/steps/${stepId}/references/${refId}`)
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['projects', vars.projectId] }),
  })
}
