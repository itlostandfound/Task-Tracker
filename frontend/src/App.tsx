import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { ClientDetailPage } from './pages/ClientDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/trackers/:id" element={<ClientDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
