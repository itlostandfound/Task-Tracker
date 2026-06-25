import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useTrackers, useDeleteTracker } from '../hooks/useClients';
import { useAppStore } from '../stores/useAppStore';
import { CreateClientModal } from '../components/CreateClientModal';
import { EditClientModal } from '../components/EditClientModal';
import toast from 'react-hot-toast';
export function DashboardPage() {
    const navigate = useNavigate();
    const { data: clients = [], isLoading } = useTrackers();
    const { setSelectedClientId, openModal, setEditingClientId } = useAppStore();
    const deleteTracker = useDeleteTracker();
    const handleClientClick = (trackerId) => {
        setSelectedClientId(trackerId);
        navigate(`/trackers/${trackerId}`);
    };
    const handleEditClient = (e, trackerId) => {
        e.stopPropagation();
        setEditingClientId(trackerId);
        openModal('edit_client');
    };
    const handleDeleteClient = (e, trackerId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this tracker?')) {
            deleteTracker.mutate(trackerId, {
                onSuccess: () => {
                    toast.success('Tracker deleted successfully');
                },
            });
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'project':
                return 'bg-indigo-900 text-indigo-300';
            case 'fixed_fee':
                return 'bg-emerald-900 text-emerald-300';
            case 'AO':
                return 'bg-purple-900 text-purple-300';
            default:
                return 'bg-slate-700 text-slate-300';
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "max-w-6xl mx-auto pt-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("span", { className: "text-5xl text-royal-gold drop-shadow-[0_0_16px_rgba(228,168,32,0.5)]", children: "\u2654" }), _jsx("h1", { className: "text-5xl font-serif font-bold gold-gradient mt-4 tracking-wide", children: "Royal Dashboard" }), _jsx("div", { className: "flourish my-3 max-w-xs mx-auto", children: _jsx("span", { children: "\u269C" }) }), _jsx("p", { className: "text-sm text-royal-gold/60 italic font-serif tracking-wide", children: "Manage Your Realm" })] }), isLoading ? (_jsx("div", { className: "text-slate-400", children: "Loading trackers..." })) : clients.length === 0 ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-slate-400 mb-6", children: "No Trackers yet. Create one to get started." }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: clients.map((client) => (_jsxs("div", { onClick: () => handleClientClick(client.id), className: "royal-panel rounded-lg p-6 hover:border-royal-gold hover:shadow-[0_8px_32px_rgba(228,168,32,0.25)] hover:-translate-y-1 transition-all duration-300 cursor-pointer", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsx("h2", { className: "text-xl font-serif font-bold text-royal-gold drop-shadow-[0_0_8px_rgba(228,168,32,0.2)]", children: client.name }), _jsxs("div", { className: "flex gap-2", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: (e) => handleEditClient(e, client.id), className: "p-2 rounded bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 border border-royal-gold/40 transition", title: "Edit tracker", children: "\u270E" }), _jsx("button", { onClick: (e) => handleDeleteClient(e, client.id), className: "p-2 rounded bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-800 transition", title: "Delete tracker", children: "\u2715" })] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: `px-3 py-1 rounded text-sm font-medium ${getTypeColor(client.client_type)}`, children: client.client_type.replace('_', ' ') }), client.open_task_count > 0 && (_jsxs("span", { className: "px-3 py-1 rounded text-sm font-medium bg-royal-border text-royal-muted", children: [client.open_task_count, " open task", client.open_task_count !== 1 ? 's' : ''] }))] })] }, client.id))) }))] }), _jsx(CreateClientModal, {}), _jsx(EditClientModal, { clientId: null })] }));
}
