import { useState, useEffect } from 'react'
import { getSessions } from '../../api/speakbot'

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function SpeakbotSessionLogs({ tenantId }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tenantId) return
    getSessions(tenantId, 50)
      .then((res) => {
        setSessions(Array.isArray(res.data) ? res.data : res.data?.sessions || [])
      })
      .catch((e) => {
        if (e.response?.status === 404 || !e.response) {
          setSessions([])
        } else {
          setError('Speakbot knowledge service unavailable. Check that the microservice is running.')
        }
      })
      .finally(() => setLoading(false))
  }, [tenantId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-2xl">
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-xl gap-3">
          <div className="text-4xl opacity-30">🎙</div>
          <div className="text-sm text-gray-500">No voice sessions recorded yet.</div>
          <div className="text-xs text-gray-600">Sessions will appear here after guests use the kiosk.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="text-sm font-medium text-white">Session Logs</div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Date / Time</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Duration</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Language</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Mode</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {sessions.map((session, i) => {
              const summary = session.transcript?.[0]?.original_text ||
                session.summary ||
                session.first_message ||
                ''
              return (
                <tr key={session.session_id || i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-300 whitespace-nowrap">
                    {formatDateTime(session.created_at || session.started_at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    {formatDuration(session.duration_seconds || session.duration)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-full uppercase">
                      {session.guest_language || session.language || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      (session.mode || '') === 'manual'
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'bg-[#0F6E56]/10 text-[#5FC8A8]'
                    }`}>
                      {session.mode === 'manual' ? 'Manual' : 'Auto'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[220px] truncate">
                    {summary ? summary.slice(0, 60) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
