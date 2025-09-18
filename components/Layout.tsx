import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { HomeIcon, ChartBarIcon, CogIcon, DocumentTextIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

const NavItem = ({ href, label, icon: Icon }:{href:string, label:string, icon: any}) => {
  const { pathname } = useRouter()
  const active = pathname === href

  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-primary text-white shadow-glow'
          : 'text-neutral-600 hover:bg-white hover:text-neutral-900 hover:shadow-soft'
      }`}
    >
      <Icon className={`h-5 w-5 transition-colors ${
        active ? 'text-white' : 'text-neutral-400 group-hover:text-primary-500'
      }`} />
      <span className="relative z-10">{label}</span>
      {active && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-90 blur-sm" />
      )}
    </Link>
  )
}

const navigation = [
  { href: '/onboarding', label: 'Profile', icon: ClipboardDocumentListIcon },
  { href: '/', label: 'Input Analysis', icon: HomeIcon },
  { href: '/results', label: 'Results', icon: ChartBarIcon },
  { href: '/settings', label: 'Settings', icon: CogIcon }
]

export default function Layout({ children }:{children: ReactNode}){
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="mx-auto flex max-w-7xl gap-8 p-6">
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-6">
            <div className="mb-8 flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-soft backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gradient">VC Analysis</h1>
                <p className="text-xs text-neutral-500">Investment Intelligence</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-4 px-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Navigation
                </h3>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                  />
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="animate-fade-in">
            <div className="glass rounded-3xl p-8 shadow-soft">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
