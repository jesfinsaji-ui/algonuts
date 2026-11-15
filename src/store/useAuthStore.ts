import { create } from 'zustand'
import type { DemoSession } from '../types'
import {
  clearDemoSession,
  createDemoSession,
  persistDemoSession,
  readDemoSession,
} from '../services/demoAuth'

interface AuthStore {
  session: DemoSession | null
  signIn: (email: string, remember: boolean) => DemoSession
  signOut: () => void
}

export const useAuthStore = create<AuthStore>()((set) => ({
  session: readDemoSession(),
  signIn: (email, remember) => {
    const session = createDemoSession(email, remember)
    persistDemoSession(session)
    set({ session })
    return session
  },
  signOut: () => {
    clearDemoSession()
    set({ session: null })
  },
}))
