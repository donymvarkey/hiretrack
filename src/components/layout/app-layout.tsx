import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { BottomNav } from './bottom-nav'
import { QuickAddModal } from '@/components/features/quick-add-modal'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          className="flex-1 overflow-y-auto"
          style={{
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          <div className="mx-auto w-full max-w-6xl p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:p-6 lg:p-8 lg:pb-8 animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
      <QuickAddModal />
    </div>
  )
}
