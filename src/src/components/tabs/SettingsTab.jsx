import { useState } from 'react'

const LANGUAGES = [{ value: 'vi', label: 'Vietnamese' }, { value: 'en', label: 'English' }, { value: 'bilingual', label: 'Bilingual (VI+EN)' }]
const TONES = ['Friendly', 'Professional', 'Casual', 'Formal']
const INDUSTRIES = ['F&B', 'Spa & Wellness', 'Retail', 'Agriculture', 'Real Estate', 'Education', 'Other']

export default function SettingsTab({ bot, onUpdate }) {
  const [form, setForm] = useState({
    name: bot?.name || '',
    industry: bot?.industry || 'F&B',
    persona: bot?.persona || '',
    language: bot?.language || 'vi',
    tone: bot?.tone || 'Friendly',
    maxLength: bot?.maxLength || 200,
  })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    await onUpdate(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg space-y-5">
      <Field label="Business Name">
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
      </Field>

      <Field label="Industry">
        <select className="input" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </Field>

      <Field label="Bot Persona">
        <textarea
          className="input h-28 resize-none"
          placeholder="Describe your bot's personality and role..."
          value={form.persona}
          onChange={(e) => set('persona', e.target.value)}
        />
        <div className="text-right text-xs text-gray-600 mt-1">{form.persona.length} chars</div>
      </Field>

      <Field label="Language">
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map(({ value, label }) => (
            <button key={value} onClick={() => set('language', value)}
              className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                form.language === value
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Response Tone">
        <div className="flex gap-2 flex-wrap">
          {TONES.map((t) => (
            <button key={t} onClick={() => set('tone', t)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                form.tone === t
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </Field>

      <Field label={`Max Response Length: ${form.maxLength} words`}>
        <input type="range" min={50} max={500} step={25} value={form.maxLength}
          onChange={(e) => set('maxLength', Number(e.target.value))}
          className="w-full accent-indigo-500" />
        <div className="flex justify-between text-xs text-gray-600 mt-1"><span>50</span><span>500</span></div>
      </Field>

      <button onClick={handleSave} className={`btn-primary ${saved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}>
        {saved ? '✓ Saved' : 'Save Settings'}
      </button>
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
