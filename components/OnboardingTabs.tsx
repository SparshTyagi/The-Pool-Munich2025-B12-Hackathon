import Link from 'next/link'
import { useRouter } from 'next/router'

type Props = {
  active?: 'facts' | 'soft'
  onChange?: (tab: 'facts' | 'soft') => void
  className?: string
}

export default function OnboardingTabs({ active, onChange, className }: Props){
  const router = useRouter()
  const path = router.asPath || ''
  const routeIsFacts = /\/onboarding(?:\/facts)?$/.test(path) || path.startsWith('/onboarding/facts')
  const routeIsSoft = path.startsWith('/onboarding/soft')

  const isFacts = active ? active === 'facts' : routeIsFacts && !routeIsSoft
  const isSoft = active ? active === 'soft' : routeIsSoft

  const container = `flex w-full max-w-xl items-center rounded-2xl border border-primary-100 bg-white/90 p-1 shadow-soft backdrop-blur ${className || ''}`
  const base = 'flex-1 rounded-xl px-5 py-3 text-center text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2'
  const activeCls = 'bg-gradient-primary text-white shadow-glow'
  const inactiveCls = 'text-neutral-600 hover:bg-primary-50/70 hover:text-neutral-900'

  return (
    <nav className="flex items-center justify-center">
      <div className={container}>
        {onChange ? (
          <>
            <button
              type="button"
              onClick={() => onChange('facts')}
              className={`${base} ${isFacts ? activeCls : inactiveCls}`}
              aria-pressed={isFacts}
            >
              Hard facts
            </button>
            <button
              type="button"
              onClick={() => onChange('soft')}
              className={`${base} ${isSoft ? activeCls : inactiveCls}`}
              aria-pressed={isSoft}
            >
              Vision & philosophy
            </button>
          </>
        ) : (
          <>
            <Link
              href="/onboarding/facts"
              className={`${base} ${isFacts ? activeCls : inactiveCls}`}
            >
              Hard facts
            </Link>
            <Link
              href="/onboarding/soft"
              className={`${base} ${isSoft ? activeCls : inactiveCls}`}
            >
              Vision & philosophy
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}





