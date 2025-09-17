import { ChatBubbleLeftRightIcon, LightBulbIcon } from '@heroicons/react/24/outline'

type Props = {
  value: string
  onChange: (v: string) => void
}

const placeholder = 'Add any helpful context for the review...'

const tips = [
  'Describe your funding stage and runway outlook',
  'Call out key milestones and traction metrics',
  'Highlight competitive dynamics or market challenges',
  'Note material risks, dependencies, or compliance needs',
  'Share strategic goals for the upcoming 12 months'
]

export default function ContextField({ value, onChange }: Props){
  return (
    <div className="card h-full flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Additional Context</h3>
          <p className="text-sm text-neutral-600">Share background details to guide the investment review</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, 1000))}
            placeholder={placeholder}
            className="input min-h-[220px] w-full text-neutral-900 leading-relaxed placeholder:text-neutral-400"
            rows={8}
            maxLength={1000}
          />
          <div className="pointer-events-none absolute bottom-3 right-4 text-xs text-neutral-400">
            {value.length}/1000
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50/60 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-800">
          <LightBulbIcon className="h-4 w-4" />
          <span>Tips for a focused review</span>
        </div>
        <ul className="space-y-2 text-sm text-primary-900">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" aria-hidden="true"></span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
