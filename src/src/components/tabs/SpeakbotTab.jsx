import { useState, useEffect } from 'react'
import {
  startSession,
  endSession,
  testTranslation,
  getSessionTranscript,
  getHealth,
} from '../../api/speakbot'

const LANGUAGES = [
  { code: 'en', name: 'English',  flag: '🇬🇧', native: 'English'  },
  { code: 'ko', name: 'Korean',   flag: '🇰🇷', native: '한국어'    },
  { code: 'zh', name: 'Chinese',  flag: '🇨🇳', native: '中文'      },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語'    },
  { code: 'ru', name: 'Russian',  flag: '🇷🇺', native: 'Русский'  },
]

const SPEAKBOT_URL = import.meta.env.VITE_SPEAKBOT_URL ||
  'https://izi-speakbot-production-4695.up.railway.app'

export default function SpeakbotTab({ tenant }) {
  const [subTab, setSubTab] = useState('overview')
  const [health, setHealth] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionError, setSessionError] = useState(null)
  const [selectedLang, setSelectedLang] = useState('en')
  const [transcript, setTranscript] = useState([])

  // Test console state
  const [testText, setTestText] = useState('')
  const [testSourceLang, setTestSourceLang] = useState('en')
  const [testTargetLang, setTestTargetLang] = useState('ko')
  const [testResult, setTestResult] = useState(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState(null)

  const tenantId = tenant?.tenant_id

  useEffect(() => {
    getHealth()
      .then(() => setHealth('ok'))
      .catch(() => setHealth('error'))
  }, [])

  async function handleStartSession() {
    setSessionLoading(true)
    setSessionError(null)
    try {
      const res = await startSession(tenantId, selectedLang)
      setSessionId(res.data.session_id)
      setTranscript([])
    } catch (e) {
      setSessionError(e.response?.data?.detail || 'Failed to start session')
    } finally {
      setSessionLoading(false)
    }
  }

  async function handleEndSession() {
    if (!sessionId) return
    try {
      await endSession(sessionId)
    } catch {}
    setSessionId(null)
    setTranscript([])
  }

  async function handleTestTranslation() {
    if (!testText || !sessionId) return
    setTestLoading(true)
    setTestError(null)
    setTestResult(null)
    try {
      const res = await testTranslation(sessionId, testText, testSourceLang, testTargetLang)
      setTestResult(res.data)
    } catch (e) {
      setTestError(e.response?.data?.detail || 'Translation failed')
    } finally {
      setTestLoading(false)
    }
  }

  async function handleViewTranscript() {
    if (!sessionId) return
    try {
      const res = await getSessionTranscript(sessionId)
      setTranscript(res.data)
    } catch {}
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Sub-tab switcher */}
      <div className="flex gap-1 p-1 bg-[#1A1A26] rounded-xl w-fit border border-[#1E1E2E]">
        {[['overview', 'Overview'], ['languages', 'Languages'], ['test', 'Test Console'], ['sessions', 'Sessions']].map(([v, l]) => (
          <button key={v} onClick={() => setSubTab(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              subTab === v ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {subTab === 'overview' && (
        <div className="space-y-4">
          {/* Service status card */}
          <div className="card p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Izi Speakbot Service</div>
              <div className="text-xs text-gray-500 mt-0.5">{SPEAKBOT_URL}</div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              health === 'ok'    ? 'bg-emerald-500/10 text-emerald-400'
              : health === 'error' ? 'bg-red-500/10 text-red-400'
              : 'bg-gray-500/10 text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                health === 'ok' ? 'bg-emerald-400' : health === 'error' ? 'bg-red-400' : 'bg-gray-400'
              }`} />
              {health === 'ok' ? 'Online' : health === 'error' ? 'Offline' : 'Checking...'}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Supported Languages */}
            <div className="card p-4 space-y-2">
              <div className="text-xs text-gray-400 font-medium">Supported Languages</div>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((l) => (
                  <span key={l.code} className="flex items-center gap-1 text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-full">
                    {l.flag} {l.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Modes */}
            <div className="card p-4 space-y-2">
              <div className="text-xs text-gray-400 font-medium">Modes</div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full w-fit">
                  🖥 Auto — Guest Kiosk
                </span>
                <span className="text-xs bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-full w-fit">
                  🎙 Manual — Live Translator
                </span>
              </div>
            </div>

            {/* Voice Engine */}
            <div className="card p-4 space-y-1">
              <div className="text-xs text-gray-400 font-medium">Voice Engine</div>
              <div className="text-sm text-white">ElevenLabs</div>
              <div className="text-xs text-gray-500">eleven_multilingual_v2</div>
            </div>

            {/* Speech Recognition */}
            <div className="card p-4 space-y-1">
              <div className="text-xs text-gray-400 font-medium">Speech Recognition</div>
              <div className="text-sm text-white">OpenAI Whisper</div>
              <div className="text-xs text-gray-500">whisper-1</div>
            </div>
          </div>

          {/* How it works */}
          <div className="card p-4 space-y-3">
            <div className="text-xs text-gray-400 font-medium">How it works</div>
            {[
              ['1', 'Guest selects language on kiosk'],
              ['2', 'Speaks or types — Whisper transcribes'],
              ['3', 'Claude answers from hotel KB · ElevenLabs speaks reply'],
            ].map(([n, text]) => (
              <div key={n} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-medium">
                  {n}
                </span>
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Languages ── */}
      {subTab === 'languages' && (
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-white">Configured Languages</div>
            <div className="text-xs text-gray-500 mt-0.5">
              These 5 languages are active for this tenant.
              Voice IDs are configured in the speakbot service environment.
            </div>
          </div>

          <div className="card divide-y divide-[#1E1E2E]">
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className="flex items-center gap-4 px-4 py-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{lang.name}</div>
                  <div className="text-xs text-gray-500">{lang.native}</div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                  Active
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3 text-xs text-blue-300">
            💡 To add more languages, update the ElevenLabs voice IDs in Railway →
            izi-speakbot → Variables and update LANGUAGES in AppConfig.dart.
          </div>
        </div>
      )}

      {/* ── Test Console ── */}
      {subTab === 'test' && (
        <div className="space-y-4">
          {/* Session control */}
          <div className="card p-4 space-y-3">
            <label className="block text-xs text-gray-400 font-medium">Active Session</label>

            {!sessionId ? (
              <>
                <select
                  className="input"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStartSession}
                  disabled={sessionLoading}
                  className="btn btn-primary mt-2 w-full justify-center py-2.5"
                >
                  {sessionLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Starting...
                    </span>
                  ) : 'Start Test Session'}
                </button>
                {sessionError && (
                  <div className="text-xs text-red-400">{sessionError}</div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Session active · {sessionId.slice(0, 8)}...
                </span>
                <button
                  onClick={handleEndSession}
                  className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
                >
                  End Session
                </button>
              </div>
            )}
          </div>

          {/* Translation tester */}
          {sessionId && (
            <div className="card p-4 space-y-3">
              <label className="block text-xs text-gray-400 font-medium">Test Translation</label>

              <div className="flex gap-2">
                <select
                  className="input flex-1"
                  value={testSourceLang}
                  onChange={(e) => setTestSourceLang(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
                <select
                  className="input flex-1"
                  value={testTargetLang}
                  onChange={(e) => setTestTargetLang(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              <textarea
                className="input min-h-[80px] resize-y text-sm mt-2"
                placeholder="Enter text to translate..."
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
              />

              <button
                onClick={handleTestTranslation}
                disabled={!testText || testLoading}
                className={`btn-primary text-sm ${(!testText || testLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {testLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Translating...
                  </span>
                ) : 'Translate'}
              </button>

              {testResult && (
                <div className="card p-4 mt-3 space-y-2">
                  <div className="text-xs text-gray-500">Translation result</div>
                  <div className="text-sm text-white">{testResult.translated_text}</div>
                  <div className="flex gap-2 text-xs text-gray-600">
                    <span>{testResult.source_language} → {testResult.target_language}</span>
                  </div>
                </div>
              )}

              {testError && (
                <div className="text-xs text-red-400">{testError}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Sessions ── */}
      {subTab === 'sessions' && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-white">Session Management</div>

          <div className="rounded-lg bg-[#1A1A26] border border-[#1E1E2E] p-4 space-y-3">
            <div className="text-xs text-gray-500">
              Sessions are stored in Redis (4hr TTL) and synced to MongoDB.
              Use the Test Console tab to start a live session and test translations.
            </div>
          </div>

          {sessionId ? (
            <div className="card p-4 space-y-3">
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Session ID</div>
                  <div className="text-xs text-white font-mono">{sessionId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Tenant</div>
                  <div className="text-xs text-white">{tenantId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Language</div>
                  <div className="text-xs text-white">{selectedLang}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Status</div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                    Active
                  </span>
                </div>
              </div>

              <button
                onClick={handleViewTranscript}
                className="btn-ghost text-xs"
              >
                View Transcript
              </button>

              {transcript.length > 0 && (
                <div className="card divide-y divide-[#1E1E2E] mt-2">
                  {transcript.map((entry, i) => (
                    <div key={entry.entry_id || i} className="px-3 py-2 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          entry.speaker === 'guest' ? 'text-indigo-400' : 'text-emerald-400'
                        }`}>
                          {entry.speaker}
                        </span>
                        <span className="text-xs text-gray-600">{entry.language}</span>
                      </div>
                      <div className="text-xs text-white">{entry.original_text}</div>
                      {entry.translated_text && (
                        <div className="text-xs text-gray-400 italic">{entry.translated_text}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-600 py-6 text-center border border-dashed border-[#1E1E2E] rounded-lg">
              No active session — start one in the Test Console tab
            </div>
          )}
        </div>
      )}
    </div>
  )
}
