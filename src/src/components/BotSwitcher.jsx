export default function BotSwitcher({ activeBot, onChange }) {
  return (
    <div
      className="flex gap-2 bg-[#16161D] border border-white/[0.06] rounded-lg p-1.5"
      style={{ width: 'fit-content' }}
    >
      <button
        onClick={() => onChange('chatizi')}
        className="px-4 py-1.5 rounded-md text-sm font-medium"
        style={{
          backgroundColor: activeBot === 'chatizi' ? '#534AB7' : 'transparent',
          color: activeBot === 'chatizi' ? '#EEEDFE' : '#9CA3AF',
          transition: 'background-color 150ms ease, color 150ms ease',
        }}
        onMouseEnter={(e) => {
          if (activeBot !== 'chatizi') {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = '#E5E7EB'
          }
        }}
        onMouseLeave={(e) => {
          if (activeBot !== 'chatizi') {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#9CA3AF'
          }
        }}
      >
        💬 Chatizi
      </button>

      <button
        onClick={() => onChange('speakbot')}
        className="px-4 py-1.5 rounded-md text-sm font-medium"
        style={{
          backgroundColor: activeBot === 'speakbot' ? '#0F6E56' : 'transparent',
          color: activeBot === 'speakbot' ? '#E1F5EE' : '#9CA3AF',
          transition: 'background-color 150ms ease, color 150ms ease',
        }}
        onMouseEnter={(e) => {
          if (activeBot !== 'speakbot') {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = '#E5E7EB'
          }
        }}
        onMouseLeave={(e) => {
          if (activeBot !== 'speakbot') {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#9CA3AF'
          }
        }}
      >
        🎙 Izi Speakbot
      </button>
    </div>
  )
}
