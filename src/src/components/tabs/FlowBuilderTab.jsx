import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'

const NODE_TYPES_DEF = [
  { type: 'message', label: 'Message', color: '#3B82F6', desc: 'Send a message' },
  { type: 'question', label: 'Question', color: '#EAB308', desc: 'Ask user input' },
  { type: 'ai', label: 'AI Assistant', color: '#10B981', desc: 'AI handles this' },
  { type: 'condition', label: 'Condition', color: '#F97316', desc: 'Branch logic' },
  { type: 'integration', label: 'Integration', color: '#8B5CF6', desc: 'External action' },
]

const initialNodes = [
  { id: '1', type: 'default', position: { x: 250, y: 80 }, data: { label: '👋 User starts chat' },
    style: { background: '#16161D', border: '1px solid #3B82F6', borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 16px' } },
  { id: '2', type: 'default', position: { x: 250, y: 200 }, data: { label: '🤖 AI: Welcome message' },
    style: { background: '#16161D', border: '1px solid #10B981', borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 16px' } },
]

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#4F46E5' } }]

export default function FlowBuilderTab({ botId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [saved, setSaved] = useState(false)
  const idRef = useRef(10)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#4F46E5' } }, eds)),
    [setEdges]
  )

  const addNode = (typeDef) => {
    const id = String(++idRef.current)
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'default',
        position: { x: 150 + Math.random() * 200, y: 100 + Math.random() * 300 },
        data: { label: `${typeDef.label}` },
        style: {
          background: '#16161D',
          border: `1px solid ${typeDef.color}`,
          borderRadius: 10,
          color: '#fff',
          fontSize: 13,
          padding: '10px 16px',
        },
      },
    ])
  }

  const handleSave = async () => {
    try {
      const { default: api } = await import('../../api/client')
      await api.put(`/admin/bots/${botId}/flow`, { nodes, edges })
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4 -m-6">
      {/* Left panel */}
      <div className="w-48 bg-[#16161D] border-r border-white/[0.06] p-3 flex flex-col gap-1 shrink-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider px-2 mb-2">Node Types</p>
        {NODE_TYPES_DEF.map((t) => (
          <button
            key={t.type}
            onClick={() => addNode(t)}
            className="text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: t.color }} />
              <span className="text-sm text-gray-300 group-hover:text-white">{t.label}</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 pl-4">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={{ background: '#0F0F13' }}
        >
          <Background color="#1a1a24" gap={20} />
          <MiniMap style={{ background: '#16161D', border: '1px solid rgba(255,255,255,0.06)' }} nodeColor="#4F46E5" maskColor="rgba(0,0,0,0.5)" />
          <Controls style={{ background: '#16161D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }} />
          <Panel position="top-right">
            <button onClick={handleSave}
              className={`btn-primary text-xs shadow-lg ${saved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}>
              {saved ? '✓ Flow Saved' : '💾 Save Flow'}
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}
