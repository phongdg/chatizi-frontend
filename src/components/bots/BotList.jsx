import BotCard from './BotCard'

export default function BotList({ bots, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-3/4" />
                <div className="h-2 bg-white/5 rounded w-1/2" />
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded mb-3" />
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.04]">
              <div className="h-8 bg-white/5 rounded" />
              <div className="h-8 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!bots.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
          <span className="text-3xl">🤖</span>
        </div>
        <h3 className="text-white font-semibold mb-1">No bots yet</h3>
        <p className="text-gray-500 text-sm">Create your first AI receptionist to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {bots.map((bot) => <BotCard key={bot.id} bot={bot} />)}
    </div>
  )
}
