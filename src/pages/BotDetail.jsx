import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import TopBar from '../components/layout/TopBar'
import { useBot } from '../hooks/useBot'
import BotSwitcher from '../components/BotSwitcher'

// Chatizi tabs
import StyleTab from '../components/tabs/StyleTab'
import SettingsTab from '../components/tabs/SettingsTab'
import KnowledgeTab from '../components/tabs/KnowledgeTab'
import IntegrationsTab from '../components/tabs/IntegrationsTab'
import ReportsTab from '../components/tabs/ReportsTab'
import ResponsesTab from '../components/tabs/ResponsesTab'
import FlowBuilderTab from '../components/tabs/FlowBuilderTab'

// Speakbot tabs
import SpeakbotSettings from '../components/speakbot/SpeakbotSettings'
import SpeakbotLanguages from '../components/speakbot/SpeakbotLanguages'
import SpeakbotSessionLogs from '../components/speakbot/SpeakbotSessionLogs'
import SpeakbotReports from '../components/speakbot/SpeakbotReports'

const CHATIZI_TABS = ['Style', 'Settings', 'Knowledge', 'Integrations', 'Reports', 'Responses', 'Flow Builder', 'Bookings']
const SPEAKBOT_TABS = ['Settings', 'Knowledge', 'Languages', 'Session Logs', 'Reports']

// Per-bot accent colors
const ACCENT = {
  chatizi:  '#534AB7',
  speakbot: '#0F6E56',
}

export default function BotDetail() {
  const { botId } = useParams()
  const navigate = useNavigate()
  const { bot, loading, update } = useBot(botId)

  const storageKey = `chatizi_active_bot_${botId}`
  const [activeBot, setActiveBot] = useState(() => localStorage.getItem(storageKey) || 'chatizi')
  const [activeTab, setActiveTab] = useState(activeBot === 'chatizi' ? 'Settings' : 'Settings')

  // Persist active bot selection and reset tab on switch
  function handleBotSwitch(bot) {
    setActiveBot(bot)
    localStorage.setItem(storageKey, bot)
    setActiveTab(bot === 'chatizi' ? CHATIZI_TABS[0] : SPEAKBOT_TABS[0])
  }

  const tabs = activeBot === 'chatizi' ? CHATIZI_TABS : SPEAKBOT_TABS
  const accent = ACCENT[activeBot]

  if (loading) {
    return (
      <Layout>
        <TopBar title="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  const toggleStatus = () => update({ status: bot.status === 'active' ? 'inactive' : 'active' })

  return (
    <Layout>
      <TopBar title="">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-white transition-colors">
            <BackIcon />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{bot?.name}</span>
            <span className="text-gray-600">·</span>
            <button
              onClick={toggleStatus}
              className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${
                bot?.status === 'active'
                  ? 'badge-active hover:bg-red-500/10 hover:text-red-400'
                  : 'badge-inactive hover:bg-emerald-500/10 hover:text-emerald-400'
              }`}
            >
              {bot?.status === 'active' ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
      </TopBar>

      {/* Bot Switcher — sticky below tenant header */}
      <div className="px-6 py-3 bg-[#0F0F13] border-b border-white/[0.06] shrink-0 sticky top-0 z-10">
        <BotSwitcher activeBot={activeBot} onChange={handleBotSwitch} />
      </div>

      {/* Tab bar */}
      <div className="flex gap-5 px-6 border-b border-white/[0.06] bg-[#0F0F13] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium py-3 transition-all ${
              activeTab === tab ? 'text-white border-b-2 pb-[10px]' : 'tab-inactive'
            }`}
            style={activeTab === tab ? { borderColor: accent } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <main className="flex-1 overflow-auto p-6">
        {activeBot === 'chatizi' && (
          <>
            {activeTab === 'Style'        && <StyleTab bot={bot} onUpdate={update} />}
            {activeTab === 'Settings'     && <SettingsTab bot={bot} onUpdate={update} />}
            {activeTab === 'Knowledge'    && <KnowledgeTab bot={bot} onUpdate={update} botType="chatizi" />}
            {activeTab === 'Integrations' && <IntegrationsTab bot={bot} onUpdate={update} />}
            {activeTab === 'Reports'      && <ReportsTab botId={botId} />}
            {activeTab === 'Responses'    && <ResponsesTab bot={bot} onUpdate={update} />}
            {activeTab === 'Flow Builder' && <FlowBuilderTab botId={botId} />}
            {activeTab === 'Bookings'     && <BookingsPlaceholder />}
          </>
        )}

        {activeBot === 'speakbot' && (
          <>
            {activeTab === 'Settings'     && <SpeakbotSettings tenant={bot} />}
            {activeTab === 'Knowledge'    && <KnowledgeTab bot={bot} onUpdate={update} botType="speakbot" />}
            {activeTab === 'Languages'    && <SpeakbotLanguages />}
            {activeTab === 'Session Logs' && <SpeakbotSessionLogs tenantId={bot?.tenant_id} />}
            {activeTab === 'Reports'      && <SpeakbotReports tenantId={bot?.tenant_id} />}
          </>
        )}
      </main>
    </Layout>
  )
}

function BackIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  )
}

function BookingsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="text-4xl opacity-30">📅</div>
      <div className="text-sm text-gray-400">Bookings tab</div>
      <div className="text-xs text-gray-600">Booking management will appear here.</div>
    </div>
  )
}
