import { useState } from 'react'
import { ingestUrl, ingestText } from '../../api/speakbot'

export default function KnowledgeTab({ bot, onUpdate, botType = 'chatizi' }) {
  const [mode, setMode] = useState(bot?.knowledgeMode || 'prompt')
  const [prompt, setPrompt] = useState(bot?.directPrompt || '')
  const [urls, setUrls] = useState(bot?.kbUrls || [''])
  const [saved, setSaved] = useState(false)
  const [speakbotError, setSpeakbotError] = useState(null)

  const MAX_CHARS = 4000
  const isSpeakbot = botType === 'speakbot'
  const tenantId = bot?.tenant_id

  const handleSave = async () => {
    setSpeakbotError(null)
    try {
      if (isSpeakbot) {
        // Route KB operations to Speakbot microservice
        const validUrls = urls.filter(Boolean)
        if (mode === 'kb' && validUrls.length > 0) {
          await Promise.all(validUrls.map((url) => ingestUrl(tenantId, url)))
        } else if (mode === 'prompt' && prompt.trim()) {
          await ingestText(tenantId, prompt.trim())
        }
      } else {
        await onUpdate({ knowledgeMode: mode, directPrompt: prompt, kbUrls: urls.filter(Boolean) })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      if (isSpeakbot) {
        setSpeakbotError(
          'Speakbot knowledge service unavailable. Check that the microservice is running.'
        )
      }
    }
  }

  const addUrl = () => setUrls((u) => [...u, ''])
  const updateUrl = (i, v) => setUrls((u) => u.map((x, idx) => idx === i ? v : x))
  const removeUrl = (i) => setUrls((u) => u.filter((_, idx) => idx !== i))

  return (
    <div className="max-w-2xl space-y-5">

      {/* Context banner */}
      {isSpeakbot ? (
        <div
          className="rounded-lg px-4 py-3 text-sm flex items-start gap-2"
          style={{
            backgroundColor: '#E1F5EE',
            border: '1px solid rgba(15, 110, 86, 0.2)',
            color: '#0F6E56',
          }}
        >
          <span className="flex-shrink-0">🎙</span>
          <span>
            This knowledge base is used exclusively by Izi Speakbot on-site voice kiosk.
            Keep content focused on wayfinding, room information, hotel policies, and on-site services.
          </span>
        </div>
      ) : (
        <div
          className="rounded-lg px-4 py-3 text-sm flex items-start gap-2"
          style={{
            backgroundColor: '#EEEDFE',
            border: '1px solid rgba(83, 74, 183, 0.2)',
            color: '#534AB7',
          }}
        >
          <span className="flex-shrink-0">💬</span>
          <span>
            This knowledge base is used by the Chatizi chat bot for sales, booking queries,
            and FAQs on Zalo, Messenger, and web widget.
          </span>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-[#1C1C26] rounded-lg w-fit">
        {[['prompt', 'Direct Prompt'], ['kb', 'Knowledge Base']].map(([v, l]) => (
          <button key={v} onClick={() => setMode(v)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === v
                ? isSpeakbot
                  ? 'text-white'
                  : 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            style={mode === v && isSpeakbot ? { backgroundColor: '#0F6E56' } : {}}
          >
            {l}
          </button>
        ))}
      </div>

      {mode === 'prompt' ? (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-gray-400 font-medium">System Prompt</label>
            <span className={`text-xs ${prompt.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-gray-600'}`}>
              {prompt.length} / {MAX_CHARS}
            </span>
          </div>
          <textarea
            className="input h-64 resize-none font-mono text-sm"
            placeholder={
              isSpeakbot
                ? 'You are a hotel lobby assistant. Help guests with wayfinding, room info, and hotel policies...'
                : 'You are a friendly receptionist for {business_name}. Your role is to...'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium">Website URLs to crawl</label>
            <div className="space-y-2">
              {urls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input flex-1" placeholder="https://yourwebsite.com/menu" value={url}
                    onChange={(e) => updateUrl(i, e.target.value)} />
                  {urls.length > 1 && (
                    <button onClick={() => removeUrl(i)} className="px-2 text-gray-500 hover:text-red-400 transition-colors">✕</button>
                  )}
                </div>
              ))}
              <button onClick={addUrl} className="btn-ghost text-xs">+ Add URL</button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium">Upload Documents</label>
            <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all">
              <span className="text-2xl mb-2">📄</span>
              <span className="text-xs text-gray-400">Drag & drop or click to upload</span>
              <span className="text-xs text-gray-600 mt-1">PDF, DOCX, TXT supported</span>
              <input type="file" multiple accept=".pdf,.docx,.txt" className="hidden" />
            </label>
          </div>
        </div>
      )}

      {speakbotError && (
        <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 text-xs text-red-400">
          {speakbotError}
        </div>
      )}

      <button
        onClick={handleSave}
        className={`btn-primary ${saved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
        style={!saved && isSpeakbot ? { backgroundColor: '#0F6E56' } : {}}
      >
        {saved ? '✓ Saved' : 'Save Knowledge'}
      </button>
    </div>
  )
}
