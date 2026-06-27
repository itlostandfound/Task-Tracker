import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { useChecklistStore } from '../stores/useChecklistStore'
import { RoyalCrest } from './RoyalCrest'
import { CreateChecklistModal } from './CreateChecklistModal'
import { CloneChecklistModal } from './CloneChecklistModal'
import { RenameChecklistModal } from './RenameChecklistModal'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const sidebarHidden = location.pathname.startsWith('/trackers/') || location.pathname.startsWith('/checklists/')
  const isChecklistsView = location.pathname.startsWith('/checklists')

  const { openModal: openAppModal } = useAppStore()
  const { openModal: openChecklistModal } = useChecklistStore()

  const handleCreateTracker = () => {
    openAppModal('create_client')
  }

  const handleCreateChecklist = () => {
    navigate('/checklists')
    setTimeout(() => {
      openChecklistModal('create_checklist')
    }, 0)
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

            {/* View Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => navigate('/')}
                className={`flex-1 px-3 py-2 rounded text-sm font-semibold uppercase tracking-wider transition ${
                  !isChecklistsView
                    ? 'bg-royal-gold text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Trackers
              </button>
              <button
                onClick={() => navigate('/checklists')}
                className={`flex-1 px-3 py-2 rounded text-sm font-semibold uppercase tracking-wider transition ${
                  isChecklistsView
                    ? 'bg-royal-gold text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Checklists
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={isChecklistsView ? handleCreateChecklist : handleCreateTracker}
              className="w-full px-4 py-3 rounded border-2 border-royal-gold text-royal-gold hover:bg-royal-gold/10 hover:shadow-[0_0_16px_rgba(228,168,32,0.3)] transition-all text-sm font-semibold uppercase tracking-widest"
            >
              + Create {isChecklistsView ? 'Checklist' : 'Tracker'}
            </button>
          </div>

          <RoyalCrest />
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="h-screen overflow-auto p-2 w-full">{children}</div>
      </div>

      {/* Checklist Modals */}
      <CreateChecklistModal />
      <CloneChecklistModal />
      <RenameChecklistModal />
    </div>
  )
}
