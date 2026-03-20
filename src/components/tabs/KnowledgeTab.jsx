import { useState, useEffect } from 'react'
import { ingestUrl, ingestText, getKbDocuments, deleteKbDoc } from '../../api/speakbot'

export default function KnowledgeTab({ bot, onUpdate, botType = 'chatizi' }) {
  // knowledge_source backend values: "direct_prompt" | "knowledge_base"
  // UI mode values: 'prompt' | 'kb'
  const [mode, setMode] = useState(bot?.knowledge_source === 'knowledge_base' ? 'kb' : 'prompt')
  const [prompt, setPrompt] = useState(bot?.direct_prompt || '')
  const [urls, setUrls] = useState(bot?.kbUrls || [''])
  const [saved, setSaved] = useState(false)
  const [speakbotError, setSpeakbotError] = useState(null)

  // Speakbot KB state
  const [urlInput, setUrlInput] = useState('')
  const [docs, setDocs] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [ingestLoading, setIngestLoading] = useState(false)
  const [ingestError, setIngestError] = useState(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)

  const MAX_CHARS = 4000
  const isSpeakbot = botType === 'speakbot'
  const tenantId = bot?.tenant_id

  // Load docs on mount (speakbot only)
  useEffect(() => {
    if (!isSpeakbot || !tenantId) return
    setDocsLoading(true)
    getKbDocuments(tenantId)
      .then((res) => setDocs(res.data))
      .catch(() => {})
      .finally(() => setDocsLoading(false))
  }, [isSpeakbot, tenantId])

  function showSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function loadDocs() {
    const res = await getKbDocuments(tenantId)
    setDocs(res.data)
  }

  // ── Speakbot handlers ──────────────────────────────────────────────────────

  async function handleIngestUrl() {
    if (!urlInput.trim()) return
    setIngestLoading(true)
    setIngestError(null)
    try {
      await ingestUrl(tenantId, urlInput.trim(), null)
      setUrlInput('')
      await loadDocs()
      showSaved()
    } catch (e) {
      setIngestError(e.response?.data?.detail || 'Failed to ingest URL')
    } finally {
      setIngestLoading(false)
    }
  }

  async function handleSaveAsKnowledge() {
    if (!prompt.trim()) return
    setIngestLoading(true)
    setIngestError(null)
    try {
      await ingestText(tenantId, prompt.trim(), 'Custom Instructions', 'policy')
      showSaved()
    } catch (e) {
      setIngestError(e.response?.data?.detail || 'Failed to save knowledge')
    } finally {
      setIngestLoading(false)
    }
  }

  async function handleDelete(docId) {
    setDeleteLoadingId(docId)
    try {
      await deleteKbDoc(tenantId, docId)
      setDocs((prev) => prev.filter((d) => d.doc_id !== docId))
    } catch (e) {
      setIngestError(e.response?.data?.detail || 'Failed to delete document')
    } finally {
      setDeleteLoadingId(null)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'pdf' || ext === 'docx') {
      setIngestError('PDF/DOCX parsing coming soon — please use .txt files for now')
      e.target.value = ''
      return
    }
    if (ext === 'txt') {
      setIngestLoading(true)
      setIngestError(null)
      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          await ingestText(tenantId, ev.target.result, file.name, 'policy')
          await loadDocs()
          showSaved()
        } catch (err) {
          setIngestError(err.response?.data?.detail || 'Failed to ingest file')
        } finally {
          setIngestLoading(false)
        }
      }
      reader.readAsText(file)
    }
    e.target.value = ''
  }

  // ── Chatizi handler ────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSpeakbotError(null)
    try {
      await onUpdate({
        knowledge_source: mode === 'prompt' ? 'direct_prompt' : 'knowledge_base',
        direct_prompt: prompt,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      // leave error silent for chatizi path
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  const addUrl = () => setUrls((u) => [...u, ''])
  const updateUrl = (i, v) => setUrls((u) => u.map((x, idx) => (idx === i ? v : x)))
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

      {/* ── Speakbot path ─────────────────────────────────────────────────── */}
      {isSpeakbot ? (
        <>
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
                placeholder="You are a hotel lobby assistant. Help guests with wayfinding, room info, and hotel policies..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
              />
              {ingestError && (
                <div className="mt-2 rounded-lg bg-red-500/5 border border-red-500/20 p-3 text-xs text-red-400">
                  {ingestError}
                </div>
              )}
              <button
                onClick={handleSaveAsKnowledge}
                disabled={ingestLoading || !prompt.trim()}
                className={`mt-3 btn-primary disabled:opacity-50 ${saved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
                style={!saved ? { backgroundColor: '#0F6E56' } : {}}
              >
                {ingestLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : saved ? '✓ Saved' : 'Save as Knowledge'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* URL ingest */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">Website URL to crawl</label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="https://yourwebsite.com/menu"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleIngestUrl()}
                  />
                  <button
                    onClick={handleIngestUrl}
                    disabled={ingestLoading || !urlInput.trim()}
                    className={`btn-primary px-4 disabled:opacity-50 whitespace-nowrap ${saved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
                    style={!saved ? { backgroundColor: '#0F6E56' } : {}}
                  >
                    {ingestLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved ? '✓ Added' : 'Add to KB'}
                  </button>
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">Upload Documents</label>
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#0F6E56]/40 hover:bg-[#0F6E56]/5 transition-all">
                  <span className="text-2xl mb-2">📄</span>
                  <span className="text-xs text-gray-400">Drag & drop or click to upload</span>
                  <span className="text-xs text-gray-600 mt-1">PDF, DOCX, TXT supported</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {ingestError && (
                <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 text-xs text-red-400">
                  {ingestError}
                </div>
              )}
            </div>
          )}

          {/* Document list — shown in both speakbot modes */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400 font-medium">Ingested Documents</div>
            {docsLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="w-5 h-5 border-2 border-[#0F6E56]/30 border-t-[#0F6E56] rounded-full animate-spin" />
              </div>
            ) : docs.length === 0 ? (
              <div className="text-xs text-gray-600 py-6 text-center border border-dashed border-[#1E1E2E] rounded-lg">
                No knowledge documents yet. Add a URL or text above.
              </div>
            ) : (
              <div className="rounded-lg border border-[#1E1E2E] divide-y divide-[#1E1E2E] bg-[#1A1A26]">
                {docs.map((doc) => (
                  <div key={doc.doc_id} className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm text-white font-medium truncate">{doc.title}</span>
                        <span className="shrink-0 text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                          {doc.doc_type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{doc.content_preview}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{formatDate(doc.created_at)}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.doc_id)}
                      disabled={deleteLoadingId === doc.doc_id}
                      className="shrink-0 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 mt-0.5"
                    >
                      {deleteLoadingId === doc.doc_id ? (
                        <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
                      ) : (
                        <TrashIcon />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* ── Chatizi path (unchanged) ─────────────────────────────────────── */
        <>
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
                placeholder="You are a friendly receptionist for {business_name}. Your role is to..."
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
          >
            {saved ? '✓ Saved' : 'Save Knowledge'}
          </button>
        </>
      )}
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  )
}
