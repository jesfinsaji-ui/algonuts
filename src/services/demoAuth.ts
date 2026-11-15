import type { DemoSession } from '../types'
import { uid } from '../utils/format'

export const DEMO_EMAIL = 'demo@astrovital.space'
export const DEMO_PASSWORD = 'artemis-2026'
export const DEMO_DISPLAY_NAME = 'Demo Flight Surgeon'

export const SESSION_STORAGE_KEY = 'astrovital-demo-session'
const SESSION_TAB_KEY = 'astrovital-demo-tab'

export interface DemoCredentials {
  email: string
  password: string
}

export interface CredentialCheck {
  ok: boolean
  fieldErrors: {
    email?: string
    password?: string
  }
  formError?: string
}

export function checkDemoCredentials({
  email,
  password,
}: DemoCredentials): CredentialCheck {
  const normalizedEmail = email.trim().toLowerCase()
  const fieldErrors: CredentialCheck['fieldErrors'] = {}

  if (!normalizedEmail) fieldErrors.email = 'Enter your demo email address.'
  if (!password) fieldErrors.password = 'Enter your demo password.'

  if (fieldErrors.email || fieldErrors.password) {
    return { ok: false, fieldErrors }
  }

  if (normalizedEmail !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return {
      ok: false,
      fieldErrors,
      formError:
        'Those credentials do not match the demo access pass. Use the demo credentials shown below.',
    }
  }

  return { ok: true, fieldErrors }
}

export function createDemoSession(
  email: string,
  remember: boolean,
): DemoSession {
  return {
    id: uid('SESSION'),
    email: email.trim().toLowerCase(),
    name: DEMO_DISPLAY_NAME,
    remember,
    signedInAt: Date.now(),
  }
}

function isDemoSession(value: unknown): value is DemoSession {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<DemoSession>
  return (
    typeof session.id === 'string' &&
    session.id.length > 0 &&
    typeof session.email === 'string' &&
    session.email.length > 0 &&
    typeof session.name === 'string' &&
    typeof session.remember === 'boolean' &&
    typeof session.signedInAt === 'number'
  )
}

export function persistDemoSession(session: DemoSession): void {
  try {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(session),
    )
    if (session.remember) {
      window.sessionStorage.removeItem(SESSION_TAB_KEY)
    } else {
      window.sessionStorage.setItem(SESSION_TAB_KEY, session.id)
    }
  } catch {
    // localStorage can be unavailable in private browsing contexts
  }
}

export function clearDemoSession(): void {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    window.sessionStorage.removeItem(SESSION_TAB_KEY)
  } catch {
    // ignore storage failures
  }
}

export function readDemoSession(): DemoSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isDemoSession(parsed)) {
      clearDemoSession()
      return null
    }
    if (!parsed.remember) {
      const tabSession = window.sessionStorage.getItem(SESSION_TAB_KEY)
      if (tabSession !== parsed.id) {
        clearDemoSession()
        return null
      }
    }
    return parsed
  } catch {
    clearDemoSession()
    return null
  }
}
