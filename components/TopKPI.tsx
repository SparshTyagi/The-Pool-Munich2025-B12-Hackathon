import { TrophyIcon } from '@heroicons/react/24/outline'

type TopKPIProps = {
  label: string
  value: string | number
  context?: string
  className?: string
}

export default function TopKPI({ label, value, context, className }: TopKPIProps){
  return (
    <div className={`card relative overflow-hidden text-center ${className ?? 'mx-auto max-w-lg'}`}>
      <div className="absolute top-0 right-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-gradient-primary opacity-5"></div>

      <div className="relative z-10">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <TrophyIcon className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="text-sm font-medium uppercase tracking-wider text-neutral-500">{label}</div>
        <div className="mb-3 text-5xl font-bold text-gradient">{value}</div>

        {context && (
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm text-primary-700">
            <div className="h-2 w-2 rounded-full bg-primary-500"></div>
            {context}
          </div>
        )}
      </div>
    </div>
  )
}
