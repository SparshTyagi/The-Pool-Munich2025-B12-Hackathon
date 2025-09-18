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

  const container = `inline-flex w-full max-w-md items-center gap-0 rounded-xl border border-neutral-200 bg-neutral-50 p-1 shadow-sm ${className || ''}`
  const base = 'flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold transition-all'
  const activeCls = 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
  const inactiveCls = 'text-neutral-700 hover:text-neutral-900 hover:bg-white/70'

  return (
    <nav className="mb-6 flex items-center justify-center">
      <div className={container}>
        {onChange ? (
          <>
            <button
              type="button"
              onClick={() => onChange('facts')}
              className={`${base} ${isFacts ? activeCls : inactiveCls}`}
            >
              Hard facts
            </button>
            <button
              type="button"
              onClick={() => onChange('soft')}
              className={`${base} ${isSoft ? activeCls : inactiveCls}`}
            >
              Vision & philosophy
            </button>
          </>
        ) : (
          <>
            <Link href="/onboarding/facts" className={`${base} ${isFacts ? activeCls : inactiveCls}`}>
              Hard facts
            </Link>
            <Link href="/onboarding/soft" className={`${base} ${isSoft ? activeCls : inactiveCls}`}>
              Vision & philosophy
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}


