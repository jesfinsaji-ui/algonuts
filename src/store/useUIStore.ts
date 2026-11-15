import { create } from 'zustand'
import type { ToastItem, ToastTone } from '../types'
import { uid } from '../utils/format'

interface UIStore {
  sidebarOpen: boolean
  toasts: ToastItem[]
  setSidebarOpen: (open: boolean) => void
  addToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
}

export const useUIStore = create<UIStore>()((set, get) => ({
  sidebarOpen: false,
  toasts: [],
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  addToast: (message, tone = 'default') => {
    const id = uid('TOAST')
    set((state) => ({ toasts: [...state.toasts.slice(-3), { id, message, tone }] }))
    window.setTimeout(() => {
      get().dismissToast(id)
    }, 4200)
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
