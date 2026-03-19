import { useAuthStore } from '../../store/authStore'

export default function TopBar({ title, children }) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="h-14 bg-[#0F0F13] border-b border-white/[0.06] flex items-center px-6 gap-4 shrink-0">
      <h1 className="text-sm font-semibold text-white flex-1">{title}</h1>
      {children}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
          {(user?.name || user?.email || 'A')[0].toUpperCase()}
        </div>
        <span className="text-xs text-gray-400 hidden sm:block">{user?.email || 'admin'}</span>
      </div>
    </header>
  )
}
