import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {children}
      </div>
    </div>
  )
}
