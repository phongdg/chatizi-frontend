import axios from 'axios'

// Speakbot base URL — hits the izi-speakbot microservice directly
const SPEAKBOT_URL = import.meta.env.VITE_SPEAKBOT_URL || 'https://izi-speakbot-production-4695.up.railway.app'
const SPEAKBOT_BASE_URL = import.meta.env.VITE_SPEAKBOT_BASE_URL || SPEAKBOT_URL

// Unauthenticated instance for session/translation operations (uses X-Session-ID)
const speakbotApi = axios.create({
  baseURL: SPEAKBOT_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Authenticated instance for KB + admin operations (uses JWT Bearer token)
const speakbotAuthApi = axios.create({
  baseURL: SPEAKBOT_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

speakbotAuthApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('chatizi_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Session management ──────────────────────────────────────────────────────

export const startSession = (tenantId, guestLanguage, mode = 'auto') =>
  speakbotApi.post('/session/start', {
    tenant_id: tenantId,
    mode,
    guest_language: guestLanguage,
  })

export const getSession = (sessionId) =>
  speakbotApi.get(`/session/${sessionId}`, {
    headers: { 'X-Session-ID': sessionId },
  })

export const getSessionTranscript = (sessionId) =>
  speakbotApi.get(`/session/${sessionId}/transcript`, {
    headers: { 'X-Session-ID': sessionId },
  })

export const endSession = (sessionId) =>
  speakbotApi.post(`/session/${sessionId}/end`, {}, {
    headers: { 'X-Session-ID': sessionId },
  })

export const testTranslation = (sessionId, text, sourceLang, targetLang) =>
  speakbotApi.post('/translate', {
    session_id: sessionId,
    entry_id: `test-${Date.now()}`,
    text,
    source_language: sourceLang,
    target_language: targetLang,
    speaker: 'staff',
  }, {
    headers: { 'X-Session-ID': sessionId },
  })

export const getHealth = () =>
  speakbotApi.get('/health')

// ── Knowledge Base (authenticated) ─────────────────────────────────────────

export const getKbDocuments = (tenantId) =>
  speakbotAuthApi.get(`/kb/${tenantId}/documents`)

export const ingestUrl = (tenantId, url) =>
  speakbotAuthApi.post(`/kb/${tenantId}/ingest-url`, { url })

export const ingestText = (tenantId, text) =>
  speakbotAuthApi.post(`/kb/${tenantId}/ingest-text`, { text })

export const retrainKb = (tenantId) =>
  speakbotAuthApi.post(`/kb/${tenantId}/retrain`)

export const deleteKbDoc = (tenantId, docId) =>
  speakbotAuthApi.delete(`/kb/${tenantId}/documents/${docId}`)

// ── Session logs (authenticated) ────────────────────────────────────────────

export const getSessions = (tenantId, limit = 50) =>
  speakbotAuthApi.get(`/sessions/${tenantId}?limit=${limit}`)

// ── Analytics (authenticated) ───────────────────────────────────────────────

export const getAnalyticsSummary = (tenantId) =>
  speakbotAuthApi.get(`/analytics/${tenantId}/summary`)

// ── Tenant config (authenticated) ───────────────────────────────────────────

export const getSpeakbotConfig = (tenantId) =>
  speakbotAuthApi.get(`/tenants/${tenantId}/speakbot-config`)

export const updateSpeakbotConfig = (tenantId, data) =>
  speakbotAuthApi.patch(`/tenants/${tenantId}/speakbot-config`, data)

export const getCredits = (tenantId) =>
  speakbotAuthApi.get(`/tenants/${tenantId}/credits`)
