import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center text-center p-6">
      <div>
        <div className="text-6xl mb-4">🤖</div>
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-gray-400 mb-6">This page doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mx-auto">
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
