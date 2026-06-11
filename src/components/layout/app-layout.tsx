import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { QuickAddModal } from '@/components/features/quick-add-modal'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8 animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>
      <QuickAddModal />
    </div>
  )
}
