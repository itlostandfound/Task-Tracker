import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
// Trackers
export function useTrackers() {
    return useQuery({
        queryKey: ['trackers'],
        queryFn: async () => {
            const { data } = await axios.get('/trackers');
            return data.data;
        },
    });
}
export function useTracker(id) {
    return useQuery({
        queryKey: ['trackers', id],
        queryFn: async () => {
            const { data } = await axios.get(`/trackers/${id}`);
            return data;
        },
        enabled: !!id,
    });
}
export function useCreateTracker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await axios.post('/trackers', payload);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['trackers'] }),
    });
}
export function useUpdateTracker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            const { data } = await axios.patch(`/trackers/${id}`, payload);
            return data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['trackers'] });
            qc.invalidateQueries({ queryKey: ['trackers', vars.id] });
        },
    });
}
export function useDeleteTracker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(`/trackers/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['trackers'] }),
    });
}
// Tasks
export function useTasks(trackerId, includeCompleted = false) {
    return useQuery({
        queryKey: ['tasks', trackerId, includeCompleted],
        queryFn: async () => {
            const { data } = await axios.get(`/trackers/${trackerId}/tasks`, {
                params: { include_completed: includeCompleted },
            });
            return data.data;
        },
        enabled: !!trackerId,
    });
}
export function useTask(id) {
    return useQuery({
        queryKey: ['tasks', id],
        queryFn: async () => {
            const { data } = await axios.get(`/tasks/${id}`);
            return data;
        },
        enabled: !!id,
    });
}
export function useCreateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ trackerId, payload }) => {
            const { data } = await axios.post(`/trackers/${trackerId}/tasks`, payload);
            return data;
        },
        onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['tasks', vars.trackerId] }),
    });
}
export function useUpdateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            const { data } = await axios.patch(`/tasks/${id}`, payload);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    });
}
export function useDeleteTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(`/tasks/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    });
}
// Notes
export function useNotes(taskId) {
    return useQuery({
        queryKey: ['notes', taskId],
        queryFn: async () => {
            const { data } = await axios.get(`/tasks/${taskId}/notes`);
            return data.data;
        },
        enabled: !!taskId,
    });
}
export function useNote(id) {
    return useQuery({
        queryKey: ['notes', id],
        queryFn: async () => {
            const { data } = await axios.get(`/notes/${id}`);
            return data;
        },
        enabled: !!id,
    });
}
export function useCreateNote() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ taskId, payload }) => {
            const { data } = await axios.post(`/tasks/${taskId}/notes`, payload);
            return data;
        },
        onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['notes', vars.taskId] }),
    });
}
export function useUpdateNote() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            const { data } = await axios.patch(`/notes/${id}`, payload);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
    });
}
export function useDeleteNote() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(`/notes/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
    });
}
