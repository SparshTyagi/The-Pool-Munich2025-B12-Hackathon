import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { DocumentTextIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { ReportMeta, Results } from '@/lib/api'

type ReportSearchModalProps = {
  open: boolean
  onClose: () => void
  reports: ReportMeta[]
  fetchResults: (key: string) => Promise<Results>
  onSelect: (key: string) => void
}

export default function ReportSearchModal({ open, onClose, reports, fetchResults, onSelect }: ReportSearchModalProps){
  const [searchText, setSearchText] = useState('')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [detailsByKey, setDetailsByKey] = useState<Record<string, Results>>({})
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    // Prevent background scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  useEffect(() => {
    if (!open) return
    // Prefetch details for all reports (only for those missing)
    const load = async () => {
      const missing = reports.filter(r => {
        const key = r.report_id || String(r.id)
        return !detailsByKey[key]
      })
      if (missing.length === 0) return
      setLoading(true)
      try {
        const entries = await Promise.all(
          missing.map(async (r) => {
            const key = r.report_id || String(r.id)
            const res = await fetchResults(key)
            return [key, res] as const
          })
        )
        setDetailsByKey(prev => {
          const next = { ...prev }
          for (const [k, v] of entries) next[k] = v
          return next
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, reports])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null
    const to = toDate ? new Date(toDate) : null
    const normalized = searchText.trim().toLowerCase()

    return reports.filter((r) => {
      const created = new Date(r.created_at)
      if (from && created < from) return false
      if (to) {
        const toEnd = new Date(to)
        toEnd.setHours(23,59,59,999)
        if (created > toEnd) return false
      }
      if (!normalized) return true
      const key = r.report_id || String(r.id)
      const det = detailsByKey[key]
      if (!det) return false
      const chunks: string[] = []
      if (det?.mainKpi) {
        chunks.push(det.mainKpi.label, String(det.mainKpi.value || ''), det.mainKpi.context || '', (det as any).mainKpi?.executive_summary || '')
      }
      for (const ins of det?.insights || []) chunks.push(ins.title || '', ins.summary || '')
      for (const d of det?.Deep_dive || []) chunks.push(d.title || '', d.summary || '')
      const flags = (det?.flag_summary?.[0]) || {}
      ;(flags.green_flags || []).forEach((s: string)=>chunks.push(s))
      ;(flags.red_flags || []).forEach((s: string)=>chunks.push(s))
      return chunks.join(' ').toLowerCase().includes(normalized)
    })
  }, [reports, detailsByKey, searchText, fromDate, toDate])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-label="Close"></button>
      <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8 pointer-events-none">
        <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-strong pointer-events-auto">
          <div className="flex items-center justify-between px-6 py-4">
            <h3 className="text-lg font-semibold text-neutral-900">Search reports</h3>
            <button className="btn btn-ghost p-2 rounded-xl" onClick={onClose} aria-label="Close search">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-7">
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search within reports (title, insights, deep dive...)"
                    className="input h-11 w-full pl-9"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">From date</label>
                    <input type="date" className="input h-11 w-full" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">To date</label>
                    <input type="date" className="input h-11 w-full" value={toDate} onChange={(e)=>setToDate(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 max-h-[50vh] overflow-auto rounded-2xl border border-neutral-100">
              {loading && !searchText && (
                <div className="p-6 text-sm text-neutral-600">Loading report details…</div>
              )}
              {filtered.length === 0 && !loading ? (
                <div className="p-6 text-sm text-neutral-600">No results match your filters.</div>
              ) : null}
              {filtered.length > 0 && (
                <ul className="divide-y divide-neutral-100 bg-white">
                  {filtered.map((r) => {
                    const key = r.report_id || String(r.id)
                    const det = detailsByKey[key]
                    const date = new Date(r.created_at)
                    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    const subtitle = det?.mainKpi?.label || 'Report'
                    const snippet = det?.insights?.[0]?.summary || det?.Deep_dive?.[0]?.summary || det?.mainKpi?.context || ''
                    return (
                      <li key={key} className="group">
                        <button
                          className="flex w-full items-start gap-4 bg-white px-5 py-4 text-left transition-colors hover:bg-neutral-50"
                          onClick={() => onSelect(key)}
                        >
                          <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
                            <DocumentTextIcon className="h-4 w-4 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-neutral-900">{subtitle}</div>
                              <div className="text-xs text-neutral-500">{label} • {r.report_id ? r.report_id.slice(0,8) : `#${r.id}`}</div>
                            </div>
                            {snippet && (
                              <p className="mt-1 text-sm text-neutral-600">{snippet}</p>
                            )}
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}


