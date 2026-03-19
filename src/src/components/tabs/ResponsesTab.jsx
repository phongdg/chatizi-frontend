import { useState } from 'react'

const DEFAULT_TEMPLATES = [
  { id: 1, trigger: 'hours', response: 'We are open Monday to Saturday, 8 AM to 10 PM.' },
  { id: 2, trigger: 'price', response: 'Please check our menu at our website or ask our staff for details.' },
  { id: 3, trigger: 'location', response: 'We are located at 123 Main Street. Google Maps: [link]' },
]

export default function ResponsesTab({ bot, onUpdate }) {
  const [templates, setTemplates] = useState(bot?.response_templates?.length ? bot.response_templates : DEFAULT_TEMPLATES)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ trigger: '', response: '' })

  const openNew = () => {
    setEditing('new')
    setForm({ trigger: '', response: '' })
  }

  const openEdit = (t) => {
    setEditing(t.id)
    setForm({ trigger: t.trigger, response: t.response })
  }

  const save = () => {
    let updated
    if (editing === 'new') {
      updated = [...templates, { id: String(Date.now()), ...form }]
    } else {
      updated = templates.map((t) => t.id === editing ? { ...t, ...form } : t)
    }
    setTemplates(updated)
    onUpdate({ response_templates: updated })
    setEditing(null)
  }

  const remove = (id) => {
    const updated = templates.filter((t) => t.id !== id)
    setTemplates(updated)
    onUpdate({ response_templates: updated })
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{templates.length} fallback templates</p>
        <button onClick={openNew} className="btn-primary text-xs">+ Add Template</button>
      </div>

      {templates.map((t) => (
        <div key={t.id} className="card p-4">
          {editing === t.id ? (
            <EditForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} />
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">#{t.trigger}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(t)} className="text-xs text-gray-500 hover:text-white transition-colors">Edit</button>
                  <button onClick={() => remove(t.id)} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Delete</button>
                </div>
              </div>
              <p className="text-sm text-gray-300">{t.response}</p>
            </div>
          )}
        </div>
      ))}

      {editing === 'new' && (
        <div className="card p-4">
          <EditForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} isNew />
        </div>
      )}
    </div>
  )
}

function EditForm({ form, setForm, onSave, onCancel, isNew }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Trigger keyword</label>
        <input className="input font-mono text-sm" placeholder="e.g. hours, price, location"
          value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Response text</label>
        <textarea className="input h-20 resize-none text-sm"
          value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-ghost text-xs">Cancel</button>
        <button onClick={onSave} className="btn-primary text-xs">{isNew ? 'Add Template' : 'Save Changes'}</button>
      </div>
    </div>
  )
}
