import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useCreateTracker } from '../hooks/useClients';
import { useAppStore } from '../stores/useAppStore';
import toast from 'react-hot-toast';
export function CreateClientModal() {
    const { modal, closeModal } = useAppStore();
    const createTracker = useCreateTracker();
    const [name, setName] = useState('');
    const [clientType, setClientType] = useState('');
    const isOpen = modal.isOpen && modal.type === 'create_client';
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }
        if (!clientType.trim()) {
            toast.error('Tracker Type is required');
            return;
        }
        const payload = {
            name: name.trim(),
            client_type: clientType.trim(),
        };
        createTracker.mutate(payload, {
            onSuccess: () => {
                toast.success('Tracker created successfully');
                setName('');
                setClientType('');
                closeModal();
            },
        });
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-royal-surface rounded-lg p-6 w-full max-w-md shadow-xl border-2 border-royal-gold", children: [_jsx("h2", { className: "text-lg font-semibold text-royal-gold mb-4", children: "Create Tracker Identifier" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-royal-text mb-1", children: "Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold", placeholder: "Client / Effort / Title Name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-royal-text mb-1", children: "Tracker Type" }), _jsx("input", { type: "text", value: clientType, onChange: (e) => setClientType(e.target.value), className: "w-full px-3 py-2 bg-royal-elevated border-2 border-royal-gold rounded text-royal-text placeholder-royal-muted focus:outline-none focus:border-royal-gold", placeholder: "Enter tracker type" })] }), _jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [_jsx("button", { type: "button", onClick: closeModal, className: "px-4 py-2 rounded bg-royal-elevated text-royal-text hover:bg-royal-border transition", children: "Cancel" }), _jsx("button", { type: "submit", disabled: createTracker.isPending, className: "btn-royal disabled:opacity-50", children: createTracker.isPending ? 'Creating...' : 'Create' })] })] })] }) }));
}
