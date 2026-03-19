import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BotDetail from './pages/BotDetail'
import NotFound from './pages/NotFound'

function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)
  if (!hasHydrated) return null  // wait for persist to rehydrate before deciding
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Navigate to="/dashboard" replace /></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/bots/:botId" element={<RequireAuth><BotDetail /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
