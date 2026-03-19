import { useState, useEffect } from 'react'
import { getAnalyticsSummary } from '../../api/speakbot'

const LANG_FLAGS = { en: '🇬🇧', ko: '🇰🇷', zh: '🇨🇳', ja: '🇯🇵', ru: '🇷🇺', vi: '🇻🇳' }

function MetricCard({ label, value, sub }) {
  return (
    <div className="card p-4 space-y-1">
      <div className="text-xs text-gray-400 font-medium">{label}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  )
}

export default function SpeakbotReports({ tenantId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    getAnalyticsSummary(tenantId)
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [tenantId])

  const v = (key) => {
    if (loading) return <span className="w-10 h-5 bg-white/10 rounded animate-pulse inline-block" />
    if (!stats) return '—'
    const val = stats[key]
    return val !== undefined && val !== null ? val : '—'
  }

  const topLang = stats?.most_used_language || stats?.top_language || null

  return (
    <div className="max-w-2xl space-y-5">
      <div className="text-sm font-medium text-white">Speakbot Reports</div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Sessions today" value={v('sessions_today')} />
        <MetricCard label="Sessions this week" value={v('sessions_this_week')} />
        <MetricCard
          label="Avg session duration"
          value={
            loading ? <span className="w-10 h-5 bg-white/10 rounded animate-pulse inline-block" />
            : stats?.avg_duration_seconds != null
              ? `${Math.round(stats.avg_duration_seconds)}s`
              : '—'
          }
        />
        <MetricCard
          label="Total sessions"
          value={v('total_sessions')}
          sub="all time"
        />
      </div>

      <div className="card p-4 space-y-2">
        <div className="text-xs text-gray-400 font-medium">Most used language</div>
        {loading ? (
          <div className="w-20 h-6 bg-white/10 rounded-full animate-pulse" />
        ) : topLang ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-[#0F6E56]/20 text-[#E1F5EE]">
            {LANG_FLAGS[topLang] || ''} {topLang.toUpperCase()}
          </span>
        ) : (
          <span className="text-sm text-gray-500">—</span>
        )}
      </div>

      {!loading && !stats && (
        <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 text-xs text-red-400">
          Speakbot analytics service unavailable. Check that the microservice is running.
        </div>
      )}
    </div>
  )
}
