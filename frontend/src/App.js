import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/trackers/:id", element: _jsx(ClientDetailPage, {}) })] }) }) }));
}
