import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function OnboardingIndex(){
  const router = useRouter()
  useEffect(() => {
    router.replace('/onboarding/facts')
  }, [router])
  return null
}


