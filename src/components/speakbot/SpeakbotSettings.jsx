import { useState, useEffect } from 'react'
import {
  startSession,
  endSession,
  testTranslation,
  getHealth,
  getSpeakbotConfig,
  updateSpeakbotConfig,
  getCredits,
} from '../../api/speakbot'

const LANGUAGES = [
  { code: 'en', name: 'English',  native: 'English',  flag: '🇬🇧', tts: 'Inworld'         },
  { code: 'ko', name: 'Korean',   native: '한국어',    flag: '🇰🇷', tts: 'Inworld'         },
  { code: 'zh', name: 'Chinese',  native: '中文',      flag: '🇨🇳', tts: 'Inworld'         },
  { code: 'ja', name: 'Japanese', native: '日本語',    flag: '🇯🇵', tts: 'Inworld'         },
  { code: 'ru', name: 'Russian',  native: 'Русский',  flag: '🇷🇺', tts: 'Inworld'         },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', tts: 'Google Cloud TTS' },
]

const SPEAKBOT_URL = import.meta.env.VITE_SPEAKBOT_BASE_URL ||
  import.meta.env.VITE_SPEAKBOT_URL ||
  'https://izi-speakbot-production-4695.up.railway.app'

export default function SpeakbotSettings({ tenant }) {
  const tenantId = tenant?.tenant_id

  // Service health
  const [health, setHealth] = useState(null)

  // Config availability flag
  const [isConfigAvailable, setIsConfigAvailable] = useState(false)
  const [configLoading, setConfigLoading] = useState(true)

  // PIN Auth
  const [pinEnabled, setPinEnabled] = useState(false)
  const [pin, setPin] = useState('')
  const [pinSaved, setPinSaved] = useState(false)

  // Credits
  const [creditBalance, setCreditBalance] = useState(null)
  const [dailyLimit, setDailyLimit] = useState('')
  const [creditSaved, setCreditSaved] = useState(false)

  // Kiosk mode
  const [kioskMode, setKioskMode] = useState('auto') // 'auto' | 'manual'
  const [modeSaved, setModeSaved] = useState(false)

  // Languages
  const [enabledLangs, setEnabledLangs] = useState(['en', 'ko', 'zh', 'ja', 'ru', 'vi'])
  const [langSaved, setLangSaved] = useState(false)

  // Test console state (migrated from old SpeakbotTab)
  const [sessionId, setSessionId] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionError, setSessionError] = useState(null)
  const [selectedLang, setSelectedLang] = useState('en')
  const [testText, setTestText] = useState('')
  const [testSourceLang, setTestSourceLang] = useState('en')
  const [testTargetLang, setTestTargetLang] = useState('ko')
  const [testResult, setTestResult] = useState(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState(null)

  useEffect(() => {
    getHealth()
      .then(() => setHealth('ok'))
      .catch(() => setHealth('error'))

    if (tenantId) {
      Promise.all([
        getSpeakbotConfig(tenantId).then((res) => {
          setIsConfigAvailable(true)
          const cfg = res.data
          if (cfg.pin_enabled !== undefined) setPinEnabled(cfg.pin_enabled)
          if (cfg.pin) setPin(cfg.pin)
          if (cfg.kiosk_mode) setKioskMode(cfg.kiosk_mode)
          if (cfg.enabled_languages) setEnabledLangs(cfg.enabled_languages)
          if (cfg.daily_limit !== undefined) setDailyLimit(String(cfg.daily_limit))
        }).catch(() => setIsConfigAvailable(false)),

        getCredits(tenantId).then((res) => {
          setCreditBalance(res.data.balance ?? res.data.credits ?? null)
        }).catch(() => {}),
      ]).finally(() => setConfigLoading(false))
    }
  }, [tenantId])

  async function savePinConfig() {
    try {
      await updateSpeakbotConfig(tenantId, { pin_enabled: pinEnabled, pin })
      setPinSaved(true)
      setTimeout(() => setPinSaved(false), 2000)
    } catch {}
  }

  async function saveCreditConfig() {
    try {
      await updateSpeakbotConfig(tenantId, { daily_limit: Number(dailyLimit) })
      setCreditSaved(true)
      setTimeout(() => setCreditSaved(false), 2000)
    } catch {}
  }

  async function saveKioskMode() {
    try {
      await updateSpeakbotConfig(tenantId, { kiosk_mode: kioskMode })
      setModeSaved(true)
      setTimeout(() => setModeSaved(false), 2000)
    } catch {}
  }

  async function saveLangs() {
    try {
      await updateSpeakbotConfig(tenantId, { enabled_languages: enabledLangs })
      setLangSaved(true)
      setTimeout(() => setLangSaved(false), 2000)
    } catch {}
  }

  // Test console handlers
  async function handleStartSession() {
    setSessionLoading(true)
    setSessionError(null)
    try {
      const res = await startSession(tenantId, selectedLang)
      setSessionId(res.data.session_id)
    } catch (e) {
      setSessionError(e.response?.data?.detail || 'Failed to start session')
    } finally {
      setSessionLoading(false)
    }
  }

  async function handleEndSession() {
    if (!sessionId) return
    try { await endSession(sessionId) } catch {}
    setSessionId(null)
    setTestResult(null)
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

  function toggleLang(code) {
    setEnabledLangs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const ComingSoonBadge = () => (
    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium ml-2">
      Coming soon
    </span>
  )

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Service Status ── */}
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

      {/* ── Kiosk Mode ── */}
      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium text-white">Kiosk Mode</div>
        <div className="flex gap-2">
          <button
            onClick={() => setKioskMode('auto')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              kioskMode === 'auto'
                ? 'bg-[#0F6E56]/20 border-[#0F6E56]/50 text-[#E1F5EE]'
                : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            🖥 Auto — Guest Kiosk
          </button>
          <button
            onClick={() => setKioskMode('manual')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              kioskMode === 'manual'
                ? 'bg-[#0F6E56]/20 border-[#0F6E56]/50 text-[#E1F5EE]'
                : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            🎙 Manual — Live Translator
          </button>
        </div>
        <button
          onClick={saveKioskMode}
          disabled={!isConfigAvailable}
          className={`btn-primary text-sm ${modeSaved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
        >
          {modeSaved ? '✓ Saved' : 'Save Mode'}
          {!isConfigAvailable && <ComingSoonBadge />}
        </button>
      </div>

      {/* ── PIN Authentication ── */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white">PIN Authentication</div>
          <button
            onClick={() => setPinEnabled((v) => !v)}
            className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${
              pinEnabled ? 'bg-[#0F6E56]' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
                pinEnabled ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {pinEnabled && (
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">PIN (4–6 digits)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              className="input w-32"
              placeholder="1234"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>
        )}
        <button
          onClick={savePinConfig}
          disabled={!isConfigAvailable}
          className={`btn-primary text-sm ${pinSaved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
        >
          {pinSaved ? '✓ Saved' : 'Save PIN Config'}
          {!isConfigAvailable && <ComingSoonBadge />}
        </button>
      </div>

      {/* ── Credits ── */}
      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium text-white">Credit System</div>
        {creditBalance !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Current balance:</span>
            <span className="text-sm font-semibold text-white">{creditBalance}</span>
            <span className="text-xs text-gray-500">credits</span>
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Daily limit</label>
          <input
            type="number"
            min={0}
            className="input w-40"
            placeholder="100"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
          />
        </div>
        <button
          onClick={saveCreditConfig}
          disabled={!isConfigAvailable}
          className={`btn-primary text-sm ${creditSaved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
        >
          {creditSaved ? '✓ Saved' : 'Save Limit'}
          {!isConfigAvailable && <ComingSoonBadge />}
        </button>
      </div>

      {/* ── Languages ── */}
      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium text-white">Supported Languages</div>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <label key={lang.code} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={enabledLangs.includes(lang.code)}
                onChange={() => toggleLang(lang.code)}
                className="w-4 h-4 accent-[#0F6E56] rounded"
              />
              <span className="text-lg">{lang.flag}</span>
              <div className="flex-1">
                <span className="text-sm text-white">{lang.name}</span>
                <span className="text-xs text-gray-500 ml-2">{lang.native}</span>
              </div>
              <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                TTS: {lang.tts}
              </span>
            </label>
          ))}
        </div>
        <button
          onClick={saveLangs}
          disabled={!isConfigAvailable}
          className={`btn-primary text-sm ${langSaved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
        >
          {langSaved ? '✓ Saved' : 'Save Languages'}
          {!isConfigAvailable && <ComingSoonBadge />}
        </button>
      </div>

      {/* ── How it works ── */}
      <div className="card p-4 space-y-3">
        <div className="text-xs text-gray-400 font-medium">How it works</div>
        {[
          ['1', 'Guest selects language on kiosk'],
          ['2', 'Speaks or types — Whisper transcribes'],
          ['3', 'Claude answers from hotel KB · ElevenLabs speaks reply'],
        ].map(([n, text]) => (
          <div key={n} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0F6E56]/20 text-[#E1F5EE] text-xs flex items-center justify-center font-medium">
              {n}
            </span>
            <span className="text-sm text-gray-300">{text}</span>
          </div>
        ))}
      </div>

      {/* ── Test Console (migrated from old Speakbot tab) ── */}
      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium text-white">Test Console</div>
        <div className="text-xs text-gray-500">Start a live session to test translations and voice output.</div>

        {!sessionId ? (
          <>
            <select
              className="input"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
            <button
              onClick={handleStartSession}
              disabled={sessionLoading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {sessionLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting...
                </span>
              ) : 'Start Test Session'}
            </button>
            {sessionError && <div className="text-xs text-red-400">{sessionError}</div>}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Session active · {sessionId.slice(0, 8)}...
              </span>
              <button onClick={handleEndSession} className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs">
                End Session
              </button>
            </div>

            <div className="flex gap-2">
              <select className="input flex-1" value={testSourceLang} onChange={(e) => setTestSourceLang(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
              </select>
              <select className="input flex-1" value={testTargetLang} onChange={(e) => setTestTargetLang(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
              </select>
            </div>

            <textarea
              className="input min-h-[72px] resize-y text-sm"
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
              <div className="card p-3 space-y-1">
                <div className="text-xs text-gray-500">Result</div>
                <div className="text-sm text-white">{testResult.translated_text}</div>
                <div className="text-xs text-gray-600">{testResult.source_language} → {testResult.target_language}</div>
              </div>
            )}
            {testError && <div className="text-xs text-red-400">{testError}</div>}
          </div>
        )}
      </div>

    </div>
  )
}
