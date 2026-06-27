import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { ChecklistsPage } from './pages/ChecklistsPage'
import { ChecklistDetailPage } from './pages/ChecklistDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/trackers/:id" element={<ClientDetailPage />} />
          <Route path="/checklists" element={<ChecklistsPage />} />
          <Route path="/checklists/:id" element={<ChecklistDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
