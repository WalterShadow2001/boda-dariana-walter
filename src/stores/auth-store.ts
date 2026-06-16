import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  isAuthenticated: boolean
  isLoading: boolean
  
  // Login with password (localStorage first, server sync optional)
  login: (password: string) => Promise<boolean>
  
  // Logout
  logout: () => Promise<void>
  
  // Set auth state
  setAuthenticated: (value: boolean) => void
}

const WEDDING_PASSWORD = '2303'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: false,
      
      login: async (password: string) => {
        // First check password locally
        if (password !== WEDDING_PASSWORD) {
          return false
        }
        
        // Set authenticated locally immediately
        set({ isAuthenticated: true })
        
        // Try to sync with server in background (optional)
        try {
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          })
        } catch (error) {
          // Ignore server errors - local auth is enough
          console.log('Server sync optional, continuing with local auth')
        }
        
        return true
      },
      
      logout: async () => {
        set({ isAuthenticated: false })
        
        // Try to sync with server (optional)
        try {
          await fetch('/api/auth', { method: 'DELETE' })
        } catch (error) {
          console.log('Server sync optional')
        }
      },
      
      setAuthenticated: (value) => set({ isAuthenticated: value })
    }),
    {
      name: 'wedding-auth-storage'
    }
  )
)
