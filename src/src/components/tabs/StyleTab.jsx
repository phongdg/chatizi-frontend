import { useState } from 'react'

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left']

export default function StyleTab({ bot, onUpdate }) {
  const [form, setForm] = useState({
    widgetTitle: bot?.widgetTitle || bot?.name || 'Chat with us',
    welcomeMessage: bot?.welcomeMessage || 'Hi! How can I help you today? 👋',
    ctaText: bot?.ctaText || 'Start Chat',
    primaryColor: bot?.primaryColor || '#4F46E5',
    position: bot?.position || 'bottom-right',
  })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    await onUpdate(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex gap-6">
      {/* Controls */}
      <div className="flex-1 space-y-5 max-w-lg">
        <Field label="Widget Title">
          <input className="input" value={form.widgetTitle} onChange={(e) => set('widgetTitle', e.target.value)} />
        </Field>
        <Field label="Welcome Message">
          <textarea className="input h-20 resize-none" value={form.welcomeMessage} onChange={(e) => set('welcomeMessage', e.target.value)} />
        </Field>
        <Field label="Call-to-Action Text">
          <input className="input" value={form.ctaText} onChange={(e) => set('ctaText', e.target.value)} />
        </Field>
        <Field label="Primary Color">
          <div className="flex items-center gap-3">
            <input type="color" value={form.primaryColor} onChange={(e) => set('primaryColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <input className="input flex-1 font-mono text-sm" value={form.primaryColor}
              onChange={(e) => set('primaryColor', e.target.value)} placeholder="#4F46E5" />
          </div>
        </Field>
        <Field label="Position">
          <div className="grid grid-cols-2 gap-2">
            {POSITIONS.map((p) => (
              <button key={p} onClick={() => set('position', p)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                  form.position === p
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </Field>
        <button onClick={handleSave} className={`btn-primary ${saved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}>
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Live Preview */}
      <div className="w-72 shrink-0">
        <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Preview</p>
        <div className="card p-4 relative h-96 bg-gradient-to-br from-[#1C1C26] to-[#16161D] overflow-hidden">
          {/* Mock chat */}
          <div className="absolute inset-4 flex flex-col justify-end gap-2">
            <div className="self-start max-w-[80%] bg-white/10 rounded-xl px-3 py-2 text-xs text-gray-300">
              {form.welcomeMessage}
            </div>
            <div className="self-end max-w-[80%] rounded-xl px-3 py-2 text-xs text-white" style={{ backgroundColor: form.primaryColor }}>
              Hello!
            </div>
          </div>
          {/* Widget button */}
          <div className={`absolute bottom-4 ${form.position.includes('right') ? 'right-4' : 'left-4'}`}>
            <div className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white text-lg" style={{ backgroundColor: form.primaryColor }}>
              💬
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  )
}
