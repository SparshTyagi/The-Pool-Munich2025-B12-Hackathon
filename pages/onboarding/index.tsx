import { useState } from 'react'
import Layout from '@/components/Layout'
import OnboardingTabs from '@/components/OnboardingTabs'
import FactsForm from '@/components/onboarding/FactsForm'
import SoftForm from '@/components/onboarding/SoftForm'

export default function OnboardingIndex(){
  const [tab, setTab] = useState<'facts' | 'soft'>('facts')
  return (
    <Layout>
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-3xl border border-primary-100 bg-white p-10 shadow-soft">
          <div className="pointer-events-none absolute -top-24 -right-10 h-56 w-56 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 h-60 w-60 rounded-full bg-sky-100/40 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-semibold text-primary-600">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                Guided workspace
              </span>
              <h1 className="text-4xl font-bold text-neutral-900">Investor Onboarding</h1>
              <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
                Tell us how you invest so we can tailor diligence, sourcing, and recommendations to your mandate.
              </p>
            </div>

          </div>
        </section>

        <OnboardingTabs active={tab} onChange={setTab} />

        <div className="mx-auto max-w-5xl">
          {tab === 'facts' ? <FactsForm /> : <SoftForm />}
        </div>
      </div>
    </Layout>
  )
}




