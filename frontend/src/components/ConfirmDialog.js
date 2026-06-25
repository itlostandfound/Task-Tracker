import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ConfirmDialog({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false, onConfirm, onCancel, }) {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-slate-900 rounded-lg p-6 w-96 shadow-xl", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100 mb-3", children: title }), _jsx("p", { className: "text-slate-300 mb-6", children: message }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsx("button", { onClick: onCancel, className: "px-4 py-2 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 transition", children: cancelText }), _jsx("button", { onClick: onConfirm, className: `px-4 py-2 rounded-lg text-white transition ${isDangerous
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'}`, children: confirmText })] })] }) }));
}
