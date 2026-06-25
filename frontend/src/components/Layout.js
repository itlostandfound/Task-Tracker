import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { RoyalCrest } from './RoyalCrest';
export function Layout({ children }) {
    const location = useLocation();
    const sidebarHidden = location.pathname.startsWith('/trackers/');
    const { openModal } = useAppStore();
    const handleCreateClient = () => {
        openModal('create_client');
    };
    return (_jsxs("div", { className: "flex h-screen bg-royal-bg", children: [!sidebarHidden && (_jsxs("div", { className: "w-72 flex flex-col bg-royal-surface border-r-2 border-royal-gold", children: [_jsxs("div", { className: "flex-shrink-0 border-b-2 border-royal-gold px-6 py-6", children: [_jsx("div", { className: "text-center mb-1", children: _jsx("span", { className: "text-3xl text-royal-gold drop-shadow-[0_0_12px_rgba(228,168,32,0.5)]", children: "\u265B" }) }), _jsx("h1", { className: "text-2xl font-serif font-bold gold-gradient mb-1 text-center tracking-wide", children: "Task Tracker" }), _jsx("div", { className: "flourish my-2", children: _jsx("span", { children: "\u269C" }) }), _jsx("p", { className: "text-xs text-royal-gold/60 text-center italic font-serif mb-4", children: "A Royal Domain" }), _jsx("button", { onClick: handleCreateClient, className: "w-full px-4 py-3 rounded border-2 border-royal-gold text-royal-gold hover:bg-royal-gold/10 hover:shadow-[0_0_16px_rgba(228,168,32,0.3)] transition-all text-sm font-semibold uppercase tracking-widest", children: "+ Create Tracker" })] }), _jsx(RoyalCrest, {})] })), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx("div", { className: "h-screen overflow-auto p-2 w-full", children: children }) })] }));
}
