import { DocumentTextIcon, SparklesIcon, CpuChipIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline'


export default function LandingPage() {

    const heroHighlights = [
        {
          title: 'Document Analysis',
          description: 'Upload pitch decks, financials, and business plans',
          icon: DocumentTextIcon,
          iconTint: 'text-primary-600',
          badgeBg: 'bg-primary-100'
        },
        {
          title: 'AI-Powered Insights',
          description: 'Get detailed analysis from specialized AI agents',
          icon: SparklesIcon,
          iconTint: 'text-champagne-600',
          badgeBg: 'bg-champagne-100'
        },
        {
          title: 'Comprehensive Reports',
          description: 'Receive detailed investment recommendations',
          icon: CpuChipIcon,
          iconTint: 'text-primary-600',
          badgeBg: 'bg-primary-100'
        }
      ]

      const actionCallouts = [
        {
          title: 'Secure by default',
          description: 'Documents are encrypted in transit and removed after analysis completes.',
          icon: ShieldCheckIcon,
          iconColor: 'text-champagne-600',
          bgColor: 'bg-champagne-50/80'
        },
        {
          title: 'Fast turnaround',
          description: 'Agents usually deliver a first pass in under three minutes once you submit.',
          icon: ClockIcon,
          iconColor: 'text-secondary-600',
          bgColor: 'bg-secondary-50/80'
        }
      ]

  return (
    <div>
      <h1>Landing Page</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {heroHighlights.map(({ title, description, icon: Icon, iconTint, badgeBg }) => (
            <div key={title} className="card">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${badgeBg} shadow-inner`}>
                  <Icon className={`h-6 w-6 ${iconTint}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-accent-600">Submission</p>
            <h2 className="mt-2 text-3xl font-semibold text-neutral-900">Upload materials and share context</h2>
            <p className="mt-3 max-w-2xl text-neutral-600">
              Provide the documents and narrative your partners need. Combine board decks, financials, product notes, and add any additional color so the agents can tailor their diligence.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {actionCallouts.map(({ title, description, icon: Icon, iconColor, bgColor }) => (
              <div key={title} className={`rounded-2xl border border-neutral-200 ${bgColor} p-4 shadow-soft`}>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                  <span>{title}</span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}