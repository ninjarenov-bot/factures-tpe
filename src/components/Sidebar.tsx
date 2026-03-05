'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentCurrencyEuroIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Factures', href: '/invoices', icon: DocumentTextIcon },
  { name: 'Devis', href: '/quotes', icon: ClipboardDocumentListIcon },
  { name: 'Clients', href: '/clients', icon: UserGroupIcon },
  { name: 'Produits & Services', href: '/products', icon: ArchiveBoxIcon },
  { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
]

const bottomNavigation = [
  { name: 'Abonnement', href: '/abonnement', icon: CreditCardIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [companyName, setCompanyName] = useState<string>('Factures TPE')

  useEffect(() => {
    const supabase = createClient()
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('id', user.id)
        .single()
      if (data?.company_name) setCompanyName(data.company_name)
    }
    loadProfile()
  }, [])

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <a href="https://factures-tpe.fr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <DocumentCurrencyEuroIcon className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900 truncate">{companyName}</span>
      </a>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-indigo-600' : 'text-gray-400')} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: abonnement + version */}
      <div className="px-3 pb-3 border-t border-gray-100 pt-3 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-indigo-600' : 'text-gray-400')} />
              <span>{item.name}</span>
            </Link>
          )
        })}
        <div className="px-3 pt-2">
          <p className="text-xs text-gray-400">Factures TPE v1.0</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Bars3Icon className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <div className="relative h-full">
              <button
                className="absolute top-4 right-4 z-10 p-1 rounded-full bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
