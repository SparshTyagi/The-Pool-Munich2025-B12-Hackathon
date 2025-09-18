import Layout from '@/components/Layout'
import TopKPI from '@/components/TopKPI'
import InsightCard from '@/components/InsightCard'
import PDFDownloadButton from '@/components/PDFDownloadButton'
import { getReportPdfUrl, getResults } from '@/lib/api'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeftIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function ResultsPage(){
  const router = useRouter()
  const { jobId } = router.query
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    const id = String(jobId || 'demo')
    getResults(id).then(res => { setData(res); setLoading(false) })
  }, [jobId])

  const insights = (data?.insights || []).slice(0, 3)
  const flagSummary = (data as any)?.flag_summary?.[0] || { green_flags: [], red_flags: [] }
  const deepDive = (data as any)?.Deep_dive || []

  // Deprecated: key recommendation removed in favor of deep dive
  const recommendationSegments: string[] = []

  if (loading || !data) {
    return (
      <Layout>
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
            <span className="text-lg text-neutral-600">Loading analysis results...</span>
          </div>
          <div className="w-full max-w-md">
            <div className="h-4 overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full w-3/5 animate-pulse rounded-full bg-primary-500"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const readinessLabel = data.mainKpi?.label || 'Investment Readiness'
  const readinessValue = data.mainKpi?.value || 'B+'

  const primaryRecommendation = 'Deep dive focus areas'
  const additionalActions: string[] = []

  return (
    <Layout>
      <div className="space-y-12">
        <section className="border-b border-neutral-200 pb-8">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.back()}
              className="btn btn-ghost p-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Analysis Results</h1>
              <p className="mt-1 text-neutral-600">Comprehensive investment analysis completed</p>
            </div>
          </div>
        </section>

        <section>
          <TopKPI
            label={readinessLabel}
            value={readinessValue}
            context={data.mainKpi?.context || 'Strong traction with moderate technical risk'}
            executiveSummary={(data as any)?.mainKpi?.executive_summary}
            className="mx-auto max-w-3xl"
          />
        </section>

        {/* Flag Summary */}
        {(flagSummary.green_flags?.length || flagSummary.red_flags?.length) && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <SparklesIcon className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Flag Summary</h2>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-soft">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
                      <div className="h-3 w-3 rounded-full bg-success-500"></div>
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">Positive Signals</h3>
                  </div>
                  <div className="space-y-3">
                    {(flagSummary.green_flags || []).map((item: string, idx: number) => (
                      <div key={`g-${idx}`} className="flex items-start gap-3">
                        <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-success-500"></div>
                        <span className="text-sm text-neutral-700 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                      <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">Areas of Concern</h3>
                  </div>
                  <div className="space-y-3">
                    {(flagSummary.red_flags || []).map((item: string, idx: number) => (
                      <div key={`r-${idx}`} className="flex items-start gap-3">
                        <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-500"></div>
                        <span className="text-sm text-neutral-700 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Deep Dive replaces Key Recommendation */}
        {deepDive.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <SparklesIcon className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Deep Dive</h2>
            </div>
            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm text-neutral-700">Focus on the following to reach a firm investment decision.</p>
                  <ol className="mt-4 space-y-3 text-sm text-neutral-800">
                    {deepDive.map((item: any, idx: number) => (
                      <li key={`d-${idx}`} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">
                          {idx + 1}
                        </span>
                        <span>
                          <span className="font-semibold">{item.title}: </span>
                          <span className="text-neutral-700">{item.summary}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>
            </div>
          </section>
        )}

        {insights.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <DocumentTextIcon className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Detailed Insights</h2>
            </div>
            <p className="max-w-3xl text-sm text-neutral-600">
              Dive deeper into the findings that informed this recommendation. Each card highlights one of the high-impact observations surfaced by the agents.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {insights.map((ins: any, idx: number) => (
                <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 120}ms` }}>
                  <InsightCard insight={ins} index={idx} colorTheme={idx === 0 ? 'champagne' : 'primary'} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex justify-center border-t border-neutral-200 pt-8">
          <PDFDownloadButton href={data.reportUrl || getReportPdfUrl(String(jobId || 'demo'))} />
        </section>
      </div>
    </Layout>
  )
}
