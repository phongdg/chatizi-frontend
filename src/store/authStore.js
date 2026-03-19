import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/client'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => {
        localStorage.setItem('chatizi_token', token)
        set({ token })
      },
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('chatizi_token')
        set({ token: null, user: null })
      },
      login: async (email, password) => {
        try {
          const res = await api.post('/admin/auth/login', { email, password })
          const { access_token, user } = res.data
          localStorage.setItem('chatizi_token', access_token)
          set({ token: access_token, user })
          return { ok: true }
        } catch (err) {
          // Mock login for dev when backend doesn't have auth yet
          if (email === 'admin@chatizi.io' && password === 'chatizi123') {
            const mockToken = 'mock_jwt_token_dev'
            localStorage.setItem('chatizi_token', mockToken)
            set({ token: mockToken, user: { email, name: 'Admin' } })
            return { ok: true }
          }
          return { ok: false, error: err.response?.data?.detail || 'Login failed' }
        }
      },
    }),
    { name: 'chatizi-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)
