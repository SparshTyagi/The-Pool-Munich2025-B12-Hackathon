import { useState } from 'react'
import Layout from '@/components/Layout'
import OnboardingTabs from '@/components/OnboardingTabs'
import FactsForm from '@/components/onboarding/FactsForm'
import SoftForm from '@/components/onboarding/SoftForm'

export default function OnboardingIndex(){
  const [tab, setTab] = useState<'facts' | 'soft'>('facts')
  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="mb-2 text-center">
          <h1 className="text-3xl font-bold text-gradient">Investor Onboarding</h1>
          <p className="mx-auto mt-2 max-w-2xl text-neutral-600">
            Tell us how you invest so we can tailor diligence, sourcing and recommendations to your mandate.
          </p>
        </header>

        <OnboardingTabs active={tab} onChange={setTab} />

        {tab === 'facts' ? <FactsForm /> : <SoftForm />}
      </div>
    </Layout>
  )
}


