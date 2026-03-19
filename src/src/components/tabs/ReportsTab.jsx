import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useBotReports } from '../../hooks/useBot'

const CHANNEL_COLORS = { zalo: 'text-blue-400', facebook: 'text-blue-500', whatsapp: 'text-emerald-400' }
const STAGE_COLORS = {
  booking: 'bg-indigo-500/10 text-indigo-400',
  inquiry: 'bg-yellow-500/10 text-yellow-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  handoff: 'bg-orange-500/10 text-orange-400',
}

export default function ReportsTab({ botId }) {
  const { reports, loading } = useBotReports(botId)

  if (loading) return <div className="text-gray-500 text-sm animate-pulse">Loading reports...</div>
  if (!reports) return <div className="text-gray-500 text-sm">No data available yet.</div>

  const { stats, chartData, recentConversations } = reports

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Conversations', value: stats.totalConversations, icon: '💬', color: 'text-indigo-400' },
          { label: 'Leads Captured', value: stats.leadsCaptures, icon: '🎯', color: 'text-cyan-400' },
          { label: 'Avg Response Time', value: stats.avgResponseTime, icon: '⚡', color: 'text-yellow-400' },
          { label: 'Active Users (7d)', value: stats.activeUsers7d, icon: '👥', color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Conversation Volume (7 days)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1C1C26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12 }}
              cursor={{ stroke: '#4F46E5', strokeWidth: 1 }}
            />
            <Line type="monotone" dataKey="conversations" stroke="#4F46E5" strokeWidth={2} dot={{ fill: '#4F46E5', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Conversations */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white">Recent Conversations</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {recentConversations.map((c) => (
            <div key={c.id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
                {c.contact[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{c.contact}</span>
                  <span className={`text-xs font-medium capitalize ${CHANNEL_COLORS[c.channel] || 'text-gray-400'}`}>{c.channel}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[c.stage] || 'bg-gray-500/10 text-gray-400'}`}>{c.stage}</span>
                <span className="text-xs text-gray-600">{c.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
