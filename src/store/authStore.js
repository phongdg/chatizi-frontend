import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/client'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
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
          const res = await api.post('/admin/auth/login', { username: email, password })
          const { access_token, username } = res.data
          localStorage.setItem('chatizi_token', access_token)
          set({ token: access_token, user: { username } })
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
    {
      name: 'chatizi-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => () => {
        useAuthStore.getState().setHasHydrated(true)
      },
    }
  )
)

// Listen for 401 logout signals dispatched by the API client.
// Using an event avoids a circular import (client.js → authStore.js → client.js).
window.addEventListener('auth:logout', () => {
  useAuthStore.getState().logout()
})
