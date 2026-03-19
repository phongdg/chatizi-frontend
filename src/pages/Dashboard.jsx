import { useState } from 'react'
import Layout from '../components/layout/Layout'
import TopBar from '../components/layout/TopBar'
import BotList from '../components/bots/BotList'
import { useBots } from '../hooks/useBot'

export default function Dashboard() {
  const { bots, loading, createBot } = useBots()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', industry: 'F&B' })
  const [creating, setCreating] = useState(false)

  const INDUSTRIES = ['F&B', 'Spa & Wellness', 'Retail', 'Agriculture', 'Real Estate', 'Education', 'Other']

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    await createBot(form)
    setCreating(false)
    setShowModal(false)
    setForm({ name: '', industry: 'F&B' })
  }

  return (
    <Layout>
      <TopBar title="Chatizi — Dashboard">
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <PlusIcon /> New Bot
        </button>
      </TopBar>

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Your Bots</h2>
          <p className="text-sm text-gray-500 mt-0.5">{bots.length} receptionist{bots.length !== 1 ? 's' : ''} configured</p>
        </div>
        <BotList bots={bots} loading={loading} />
      </main>

      {/* New Bot Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-white mb-4">Create New Bot</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Bot Name</label>
                <input
                  className="input"
                  placeholder="e.g. Growise Receptionist"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Industry</label>
                <select
                  className="input"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                >
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create Bot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}
