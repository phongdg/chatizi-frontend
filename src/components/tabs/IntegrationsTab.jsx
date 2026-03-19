import { useState } from 'react'

const CHANNELS = [
  {
    id: 'zalo',
    name: 'Zalo OA',
    icon: '🔵',
    color: 'text-blue-400',
    enabledKey: 'zalo_enabled',
    fields: [
      { key: 'zalo_oa_id', label: 'OA ID', placeholder: 'e.g. 123456789' },
      { key: 'zalo_app_id', label: 'App ID', placeholder: 'e.g. 987654321' },
    ],
    hasOAuth: true,
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    icon: '💬',
    color: 'text-blue-500',
    enabledKey: 'fb_enabled',
    fields: [
      { key: 'fb_page_token', label: 'Page Access Token', placeholder: 'EAAxxxxx...', secret: true },
      { key: 'fb_page_id', label: 'Page ID', placeholder: 'e.g. 100012345678' },
    ],
  },
  {
    id: 'ghl',
    name: 'GoHighLevel (GHL)',
    icon: '⚡',
    color: 'text-orange-400',
    enabledKey: 'ghl_enabled',
    fields: [
      { key: 'ghl_api_key', label: 'API Key', placeholder: 'ghl_xxxxx...', secret: true },
      { key: 'ghl_location_id', label: 'Location ID', placeholder: 'e.g. abc123xyz' },
    ],
  },
  {
    id: 'ops',
    name: 'Ops Notifications',
    icon: '🔔',
    color: 'text-yellow-400',
    enabledKey: 'ops_enabled',
    fields: [
      { key: 'ops_zalo_group_id', label: 'Zalo Group ID', placeholder: 'e.g. g123456789' },
    ],
  },
]

export default function IntegrationsTab({ bot, onUpdate }) {
  const [values, setValues] = useState(() => {
    const init = {}
    CHANNELS.forEach((ch) => {
      init[ch.enabledKey] = bot?.[ch.enabledKey] || false
      ch.fields.forEach((f) => { init[f.key] = bot?.[f.key] || '' })
    })
    return init
  })
  const [saved, setSaved] = useState({})

  const setField = (key, value) => setValues((v) => ({ ...v, [key]: value }))

  const toggleChannel = (enabledKey) =>
    setValues((v) => ({ ...v, [enabledKey]: !v[enabledKey] }))

  const saveChannel = async (ch) => {
    const patch = { [ch.enabledKey]: values[ch.enabledKey] }
    ch.fields.forEach((f) => { patch[f.key] = values[f.key] })
    await onUpdate(patch)
    setSaved((s) => ({ ...s, [ch.id]: true }))
    setTimeout(() => setSaved((s) => ({ ...s, [ch.id]: false })), 2000)
  }

  const handleZaloAuth = () => {
    window.open(`${import.meta.env.VITE_API_URL}/oauth/zalo/callback`, '_blank')
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {CHANNELS.map((ch) => {
        const isEnabled = values[ch.enabledKey] || false

        return (
          <div key={ch.id} className={`card p-5 transition-all ${isEnabled ? 'border-white/10' : 'border-white/[0.04] opacity-70'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ch.icon}</span>
                <div>
                  <h3 className={`text-sm font-semibold ${ch.color}`}>{ch.name}</h3>
                  <span className={`text-xs ${isEnabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {isEnabled ? '● Connected' : '○ Disabled'}
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isEnabled}
                  onChange={() => toggleChannel(ch.enabledKey)}
                />
                <div className="w-10 h-5 bg-white/10 peer-checked:bg-indigo-600 rounded-full transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            {isEnabled && (
              <div className="space-y-3">
                {ch.fields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                    <input
                      className="input font-mono text-sm"
                      type={f.secret ? 'password' : 'text'}
                      placeholder={f.placeholder}
                      value={values[f.key] || ''}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => saveChannel(ch)}
                    className={`btn-primary text-xs ${saved[ch.id] ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
                  >
                    {saved[ch.id] ? '✓ Saved' : 'Save'}
                  </button>
                  {ch.hasOAuth && (
                    <button onClick={handleZaloAuth} className="btn-ghost text-xs">
                      Re-authorize via OAuth
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
