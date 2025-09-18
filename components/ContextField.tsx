import { ChatBubbleLeftRightIcon, LightBulbIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
}

const placeholder = 'Any additional information you want to share as context for the analysis. e.g., Series A, 18-month runway, seeking $2M for market expansion. Key metrics: 120% YoY growth, 15K active users...'

const tips = [
  'Describe your funding stage and runway outlook',
  'Call out key milestones and traction metrics',
  'Highlight competitive dynamics or market challenges',
  'Note material risks, dependencies, or compliance needs',
  'Share strategic goals for the upcoming 12 months'
]

export default function ContextField({ value, onChange }: Props){
  const [showTips, setShowTips] = useState(false)

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

      {/* Collapsible Tips Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex w-full items-center justify-between rounded-xl border border-primary-100 bg-primary-50/30 p-3 text-left transition-colors hover:bg-primary-50/50"
        >
          <div className="flex items-center gap-2">
            <LightBulbIcon className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">
              {showTips ? 'Hide tips' : 'Show tips for additional context'}
            </span>
          </div>
          {showTips ? (
            <ChevronUpIcon className="h-4 w-4 text-primary-600" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-primary-600" />
          )}
        </button>
        
        {showTips && (
          <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50/60 p-4">
            <ul className="space-y-2 text-sm text-primary-900">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" aria-hidden="true"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
    </div>
  )
}
