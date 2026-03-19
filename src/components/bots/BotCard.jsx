import { useNavigate } from 'react-router-dom'

const CHANNEL_ICONS = {
  zalo: { label: 'Zalo', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  facebook: { label: 'FB', color: 'text-blue-500', bg: 'bg-blue-600/10' },
  whatsapp: { label: 'WA', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
}

export default function BotCard({ bot }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/bots/${bot.id}`)}
      className="card p-5 cursor-pointer hover:border-indigo-500/30 hover:bg-[#1a1a24] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/30 to-cyan-600/20 border border-white/10 flex items-center justify-center text-sm font-bold text-indigo-300 group-hover:from-indigo-600/50 transition-all">
            {bot.name[0]}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{bot.name}</h3>
            <p className="text-xs text-gray-500">{bot.industry}</p>
          </div>
        </div>
        <span className={bot.status === 'active' ? 'badge-active' : 'badge-inactive'}>
          {bot.status}
        </span>
      </div>

      {/* Channels */}
      <div className="flex gap-1.5 mb-4">
        {(bot.channels || []).map((ch) => {
          const ic = CHANNEL_ICONS[ch] || { label: ch, color: 'text-gray-400', bg: 'bg-gray-500/10' }
          return (
            <span key={ch} className={`text-xs px-2 py-0.5 rounded-md font-medium ${ic.bg} ${ic.color}`}>
              {ic.label}
            </span>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.04]">
        <div>
          <div className="text-base font-semibold text-white">{bot.leads ?? 0}</div>
          <div className="text-xs text-gray-500">Leads</div>
        </div>
        <div>
          <div className="text-base font-semibold text-white">{bot.conversations ?? 0}</div>
          <div className="text-xs text-gray-500">Conversations</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">Last active: {bot.lastActivity}</div>
    </div>
  )
}
