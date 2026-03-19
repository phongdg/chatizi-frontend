const LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English',      flag: '🇬🇧', tts: 'Inworld',         stt: 'OpenAI Whisper' },
  { code: 'ko', name: 'Korean',     native: '한국어',        flag: '🇰🇷', tts: 'Inworld',         stt: 'OpenAI Whisper' },
  { code: 'zh', name: 'Chinese',    native: '中文',          flag: '🇨🇳', tts: 'Inworld',         stt: 'OpenAI Whisper' },
  { code: 'ja', name: 'Japanese',   native: '日本語',        flag: '🇯🇵', tts: 'Inworld',         stt: 'OpenAI Whisper' },
  { code: 'ru', name: 'Russian',    native: 'Русский',      flag: '🇷🇺', tts: 'Inworld',         stt: 'OpenAI Whisper' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt',   flag: '🇻🇳', tts: 'Google Cloud TTS', stt: 'OpenAI Whisper' },
]

export default function SpeakbotLanguages() {
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <div className="text-sm font-medium text-white">Supported Languages</div>
        <div className="text-xs text-gray-500 mt-0.5">
          Languages available on the Izi Speakbot voice kiosk.
          Enable or disable per-language in the Settings tab.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {LANGUAGES.map((lang) => (
          <div key={lang.code} className="card p-4 flex items-center gap-4">
            <span className="text-3xl flex-shrink-0">{lang.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">
                {lang.name} / <span className="text-gray-400 font-normal">{lang.native}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">TTS:</span>
                  <span className="text-xs text-gray-300 bg-white/5 px-2 py-0.5 rounded-full">{lang.tts}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">STT:</span>
                  <span className="text-xs text-gray-300 bg-white/5 px-2 py-0.5 rounded-full">{lang.stt}</span>
                </div>
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              Active
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3 text-xs text-blue-300">
        💡 To configure voice IDs, update Railway → izi-speakbot → Variables
        and update LANGUAGES in AppConfig.dart.
      </div>
    </div>
  )
}
