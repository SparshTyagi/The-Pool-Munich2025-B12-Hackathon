import Link from 'next/link'
import { useRouter } from 'next/router'

export default function OnboardingTabs(){
  const router = useRouter()
  const path = router.asPath || ''
  const isFacts = /\/onboarding(?:\/facts)?$/.test(path) || path.startsWith('/onboarding/facts')
  const isSoft = path.startsWith('/onboarding/soft')

  const tabBase = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm transition'
  const active = 'border border-primary-300 bg-primary-50 text-primary-700'
  const inactive = 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'

  return (
    <nav className="mb-6 flex items-center justify-center gap-2">
      <Link href="/onboarding/facts" className={`${tabBase} ${isFacts && !isSoft ? active : inactive}`}>
        Hard facts
      </Link>
      <Link href="/onboarding/soft" className={`${tabBase} ${isSoft ? active : inactive}`}>
        Vision & philosophy
      </Link>
    </nav>
  )
}


