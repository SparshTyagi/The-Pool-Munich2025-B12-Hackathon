import { ReactNode } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

type PageHeaderProps = {
  title: string
  description?: string
  onBack?: () => void
  action?: ReactNode
  className?: string
}

export default function PageHeader({ title, description, onBack, action, className }: PageHeaderProps){
  return (
    <section className={`relative overflow-hidden rounded-3xl border border-primary-100 bg-white p-10 shadow-soft ${className || ''}`}>
      <div className="pointer-events-none absolute -top-24 -right-10 h-56 w-56 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-60 w-60 rounded-full bg-sky-100/40 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          {onBack && (
            <button onClick={onBack} className="btn btn-ghost p-2">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-neutral-900">{title}</h1>
            {description && (
              <p className="max-w-2xl text-base leading-relaxed text-neutral-600">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  )
}


