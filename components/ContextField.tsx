import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

type Props = {
  value: string
  onChange: (v:string)=>void
}

export default function ContextField({ value, onChange }: Props){
  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Additional Context</h3>
          <p className="text-sm text-neutral-600">Help our AI agents understand your startup better</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          placeholder="Share any relevant information that might help with the analysis...

• Current funding round or stage
• Key milestones achieved
• Market challenges or opportunities
• Technical risks or advantages
• Team background or expertise
• Competitive landscape
• Growth metrics or KPIs"
          className="input h-48 w-full resize-none text-neutral-900 placeholder-neutral-400"
          rows={8}
        />

        {/* Character count */}
        <div className="absolute bottom-3 right-3 text-xs text-neutral-400">
          {value.length}/1000
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 rounded-xl bg-primary-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-primary-900">💡 Tips for better analysis:</h4>
        <ul className="text-sm text-primary-800 space-y-1">
          <li>• Mention your current runway and burn rate</li>
          <li>• Highlight any red flags or risks</li>
          <li>• Specify your target market size (TAM/SAM/SOM)</li>
          <li>• Include recent traction metrics</li>
        </ul>
      </div>
    </div>
  )
}
