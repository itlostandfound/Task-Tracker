import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useUpdateTask, useTask } from '../hooks/useClients';
import { useAppStore } from '../stores/useAppStore';
import toast from 'react-hot-toast';
export function EditTaskModal(_props) {
    const { modal, closeModal, editingTaskId, setEditingTaskId } = useAppStore();
    const { data: taskData } = useTask(editingTaskId);
    const updateTask = useUpdateTask();
    const [title, setTitle] = useState('');
    const [severity, setSeverity] = useState(10);
    const isOpen = modal.isOpen && modal.type === 'edit_task';
    useEffect(() => {
        if (taskData && isOpen) {
            setTitle(taskData.title);
            setSeverity(taskData.severity);
        }
    }, [taskData, isOpen]);
    const handleClose = () => {
        setEditingTaskId(null);
        closeModal();
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Task title is required');
            return;
        }
        if (!editingTaskId)
            return;
        updateTask.mutate({
            id: editingTaskId,
            payload: {
                title: title.trim(),
                severity,
            },
        }, {
            onSuccess: () => {
                toast.success('Task updated successfully');
                handleClose();
            },
        });
    };
    if (!isOpen || !taskData)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-royal-surface rounded-lg p-6 w-full max-w-md shadow-xl border-2 border-royal-gold", children: [_jsx("h2", { className: "text-lg font-semibold text-royal-gold mb-4", children: "Edit Task" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-royal-text mb-1", children: "Title" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), className: "w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold", placeholder: "Task title", autoFocus: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-royal-text mb-1", children: "Severity (1-10)" }), _jsx("select", { value: severity, onChange: (e) => setSeverity(parseInt(e.target.value)), className: "w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text focus:outline-none focus:border-royal-gold", children: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((sev) => (_jsxs("option", { value: sev, children: ["Severity ", sev] }, sev))) })] }), _jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [_jsx("button", { type: "button", onClick: handleClose, className: "px-4 py-2 rounded bg-royal-elevated text-royal-text hover:bg-royal-border transition", children: "Cancel" }), _jsx("button", { type: "submit", disabled: updateTask.isPending, className: "btn-royal disabled:opacity-50", children: updateTask.isPending ? 'Updating...' : 'Update' })] })] })] }) }));
}
