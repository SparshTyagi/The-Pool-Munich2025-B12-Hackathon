import { Insight } from '@/lib/api'
import { LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline'

type InsightCardProps = {
  insight: Insight
  index?: number
  colorTheme?: 'primary' | 'champagne'
}

export default function InsightCard({ insight, colorTheme = 'primary' }: InsightCardProps){
  const normalizeScore = (score?: number | string): number | undefined => {
    if (typeof score === 'number') return score;
    if (typeof score === 'string') {
      const s = score.trim().toLowerCase();
      if (s === 'strong') return 0.85;
      if (s === 'average') return 0.65;
      if (s === 'weak') return 0.4;
      const asNum = Number(s.replace(/%$/, ''));
      if (!Number.isNaN(asNum)) return asNum > 1 ? asNum / 100 : asNum;
    }
    return undefined;
  }

  const rawScore = (insight as any).score as number | string | undefined;
  const resolvedScore = normalizeScore(rawScore);
  const displayText = typeof rawScore === 'string'
    ? rawScore.charAt(0).toUpperCase() + rawScore.slice(1).toLowerCase()
    : typeof resolvedScore === 'number'
      ? `${(resolvedScore * 100).toFixed(0)}%`
      : '--'

  const getAssessmentTextColor = (score?: number) => {
    if (typeof score !== 'number') return 'text-neutral-400'
    if (score >= 0.8) return 'text-success-600'
    if (score >= 0.6) return 'text-warning-600'
    return 'text-error-600'
  }

  const getAssessmentBackground = (score?: number) => {
    if (typeof score !== 'number') return 'bg-neutral-100'
    if (score >= 0.8) return 'bg-success-50'
    if (score >= 0.6) return 'bg-warning-50'
    return 'bg-error-50'
  }

  // Always use primary theme for consistency
  const theme = {
    iconWrapper: 'bg-primary-100 group-hover:bg-primary-200',
    iconColor: 'text-primary-600'
  }

  return (
    <div className="card group flex h-full flex-col transition-all duration-300 hover:shadow-medium">
      <div className="mb-4 flex items-start gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${theme.iconWrapper}`}>
          <LightBulbIcon className={`h-5 w-5 ${theme.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 leading-tight">{insight.title}</h3>
        </div>
      </div>

      <p className="mb-4 flex-grow leading-relaxed text-neutral-700">{insight.summary}</p>

      <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4 text-neutral-400" />
          <span className="text-sm text-neutral-600">Assessment</span>
        </div>
        {typeof resolvedScore === 'number' ? (
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${getAssessmentBackground(resolvedScore)}`}>
            <div className={`h-2 w-2 rounded-full ${getAssessmentTextColor(resolvedScore).replace('text-', 'bg-')}`}></div>
            <span className={`text-sm font-medium ${getAssessmentTextColor(resolvedScore)}`}>
              {displayText}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-neutral-400"></div>
            <span className="text-sm font-medium text-neutral-500">--</span>
          </div>
        )}
      </div>
    </div>
  )
}
