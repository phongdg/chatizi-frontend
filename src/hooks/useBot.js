import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'

// Mock data used when API isn't ready yet
const MOCK_BOTS = [
  {
    id: 'bot_growise_001',
    name: 'Growise Receptionist',
    industry: 'Agriculture',
    status: 'active',
    channels: ['zalo', 'facebook'],
    leads: 142,
    conversations: 318,
    lastActivity: '2 min ago',
    persona: 'Friendly and professional agricultural consultant',
    language: 'vi',
    tone: 'professional',
  },
  {
    id: 'bot_spa_002',
    name: 'Lotus Spa Bot',
    industry: 'Wellness',
    status: 'active',
    channels: ['zalo'],
    leads: 89,
    conversations: 204,
    lastActivity: '1 hr ago',
    persona: 'Calm and welcoming spa receptionist',
    language: 'vi',
    tone: 'friendly',
  },
  {
    id: 'bot_fnb_003',
    name: 'Pho 99 Assistant',
    industry: 'F&B',
    status: 'inactive',
    channels: ['facebook'],
    leads: 31,
    conversations: 78,
    lastActivity: '3 days ago',
    persona: 'Enthusiastic food lover and restaurant host',
    language: 'vi',
    tone: 'casual',
  },
]

const MOCK_REPORTS = {
  stats: {
    totalConversations: 600,
    leadsCaptures: 262,
    avgResponseTime: '1.4s',
    activeUsers7d: 47,
  },
  chartData: [
    { date: 'Mar 8', conversations: 32 },
    { date: 'Mar 9', conversations: 45 },
    { date: 'Mar 10', conversations: 28 },
    { date: 'Mar 11', conversations: 61 },
    { date: 'Mar 12', conversations: 54 },
    { date: 'Mar 13', conversations: 73 },
    { date: 'Mar 14', conversations: 89 },
  ],
  recentConversations: [
    { id: 1, contact: 'Nguyen Van A', channel: 'zalo', stage: 'booking', lastMessage: 'I want to book for 4 people', time: '2m ago' },
    { id: 2, contact: 'Tran Thi B', channel: 'facebook', stage: 'inquiry', lastMessage: 'What are your opening hours?', time: '15m ago' },
    { id: 3, contact: 'Le Van C', channel: 'zalo', stage: 'completed', lastMessage: 'Thank you!', time: '1h ago' },
    { id: 4, contact: 'Pham D', channel: 'zalo', stage: 'handoff', lastMessage: 'I need to speak to a human', time: '2h ago' },
  ],
}

export function useBots() {
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/bots')
      setBots(res.data.bots || res.data)
    } catch {
      setBots(MOCK_BOTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const createBot = async (data) => {
    try {
      const res = await api.post('/admin/bots', data)
      await fetch()
      return res.data
    } catch {
      const newBot = { id: `bot_${Date.now()}`, ...data, status: 'inactive', channels: [], leads: 0, conversations: 0, lastActivity: 'Just now' }
      setBots((prev) => [...prev, newBot])
      return newBot
    }
  }

  return { bots, loading, error, refetch: fetch, createBot }
}

export function useBot(botId) {
  const [bot, setBot] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/admin/tenants/${botId}`)
        setBot(res.data)
      } catch {
        setBot(MOCK_BOTS.find((b) => b.id === botId) || MOCK_BOTS[0])
      } finally {
        setLoading(false)
      }
    }
    if (botId) load()
  }, [botId])

  const update = async (updates) => {
    setBot((prev) => ({ ...prev, ...updates }))
    try {
      await api.patch(`/admin/tenants/${botId}`, updates)
    } catch (err) {
      console.error('Failed to update tenant:', err)
    }
  }

  return { bot, loading, update }
}

export function useBotReports(botId) {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/admin/bots/${botId}/reports`)
        setReports(res.data)
      } catch {
        setReports(MOCK_REPORTS)
      } finally {
        setLoading(false)
      }
    }
    if (botId) load()
  }, [botId])

  return { reports, loading }
}
