import { useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { RoyalCrest } from './RoyalCrest'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const sidebarHidden = location.pathname.startsWith('/trackers/')
  const { openModal } = useAppStore()

  const handleCreateClient = () => {
    openModal('create_client')
  }

  return (
    <div className="flex h-screen bg-royal-bg">
      {!sidebarHidden && (
        <div className="w-72 flex flex-col bg-royal-surface border-r-2 border-royal-gold">
          <div className="flex-shrink-0 border-b-2 border-royal-gold px-6 py-6">
            <div className="text-center mb-1">
              <span className="text-3xl text-royal-gold drop-shadow-[0_0_12px_rgba(228,168,32,0.5)]">♛</span>
            </div>
            <h1 className="text-2xl font-serif font-bold gold-gradient mb-1 text-center tracking-wide">Task Tracker</h1>
            <div className="flourish my-2"><span>⚜</span></div>
            <p className="text-xs text-royal-gold/60 text-center italic font-serif mb-4">A Royal Domain</p>
            <button
              onClick={handleCreateClient}
              className="w-full px-4 py-3 rounded border-2 border-royal-gold text-royal-gold hover:bg-royal-gold/10 hover:shadow-[0_0_16px_rgba(228,168,32,0.3)] transition-all text-sm font-semibold uppercase tracking-widest"
            >
              + Create Tracker
            </button>
          </div>

          <RoyalCrest />
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="h-screen overflow-auto p-2 w-full">{children}</div>
      </div>
    </div>
  )
}
