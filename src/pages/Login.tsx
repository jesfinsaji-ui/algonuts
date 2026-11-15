import {
  AlertTriangle,
  ArrowRight,
  Crosshair,
  Eye,
  EyeOff,
  LogIn,
  Moon,
  Sun,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AstronautPortrait } from '../components/crew/AstronautPortrait'
import { Button } from '../components/common/Button'
import { SectionLabel } from '../components/common/SectionLabel'
import { ToastViewport } from '../components/common/ToastViewport'
import { useTheme } from '../context/useTheme'
import { CREW } from '../data/crew'
import {
  checkDemoCredentials,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from '../services/demoAuth'
import { useAuthStore } from '../store/useAuthStore'
import { useUIStore } from '../store/useUIStore'
import { cn } from '../utils/cn'

const FEATURES = [
  'Deterministic simulated telemetry',
  'Rule-based risk observations',
  'Mission-local demo session',
]

export function Login() {
  const session = useAuthStore((state) => state.session)
  const signIn = useAuthStore((state) => state.signIn)
  const addToast = useUIStore((state) => state.addToast)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [formError, setFormError] = useState('')

  if (session) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = checkDemoCredentials({ email, password })
    setFieldErrors(result.fieldErrors)
    setFormError(result.formError ?? '')
    if (!result.ok) return

    signIn(email, remember)
    addToast('Demo session established. Welcome to mission control.', 'success')
    navigate('/', { replace: true })
  }

  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setFieldErrors({})
    setFormError('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center bg-ink">
            <span className="absolute inset-[5px] border border-accent" />
            <Crosshair size={15} className="text-accent" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block font-display text-[17px] font-bold leading-none tracking-[-0.02em]">
              ASTROVITAL
            </span>
            <span className="mt-1 block font-mono text-[7.5px] uppercase tracking-[0.22em] text-muted">
              Crew health system
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden text-right sm:block">
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              Artemis Demo Mission
            </span>
            <span className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Access control
            </span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center border border-line text-ink transition-colors hover:border-ink"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={16} strokeWidth={1.7} />
            ) : (
              <Moon size={16} strokeWidth={1.7} />
            )}
          </button>
        </div>
      </header>

      <main className="grid flex-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <section className="flex flex-col justify-between gap-10 border-b border-line px-4 py-10 sm:px-6 sm:py-12 lg:border-b-0 lg:border-r lg:px-10 lg:py-14 xl:px-14">
          <div>
            <div className="label">AstroVital / Mission access</div>
            <h1 className="mt-5 font-display text-[42px] font-semibold uppercase leading-[0.9] tracking-[-0.045em] sm:text-[58px] lg:text-[64px] xl:text-[74px]">
              Beyond Earth.
              <br />
              Better health<span className="text-accent">.</span>
            </h1>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-muted sm:text-sm">
              Astronaut Health Monitoring System
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 border border-line px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Artemis Demo Mission
              </span>
              <span className="border border-line px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                MET 128d 04h 17m
              </span>
            </div>
          </div>

          <div className="max-w-xl border border-line bg-surface p-3 sm:p-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <SectionLabel index="01">Crew signal preview</SectionLabel>
              <span className="border border-accent px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-accent">
                Demo
              </span>
            </div>
            <div className="mt-3 flex items-stretch gap-3 sm:gap-4">
              <AstronautPortrait
                crew={CREW[0]}
                live={false}
                className="w-[86px] shrink-0 sm:w-[112px]"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="label">Commander</div>
                  <div className="mt-1 truncate font-display text-lg font-semibold tracking-[-0.01em] sm:text-xl">
                    {CREW[0].name}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-muted">
                    Simulated vitals preview. No live crew or spacecraft data is
                    connected.
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-px border border-line bg-line">
                  <div className="bg-surface px-2 py-2">
                    <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                      HR
                    </div>
                    <div className="mt-1 font-mono text-[11px] tabular-nums">
                      68 <span className="text-[8px] text-muted">bpm</span>
                    </div>
                  </div>
                  <div className="bg-surface px-2 py-2">
                    <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                      SpO2
                    </div>
                    <div className="mt-1 font-mono text-[11px] tabular-nums">
                      98 <span className="text-[8px] text-muted">%</span>
                    </div>
                  </div>
                  <div className="bg-surface px-2 py-2">
                    <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                      Sleep
                    </div>
                    <div className="mt-1 font-mono text-[11px] tabular-nums">
                      7.1 <span className="text-[8px] text-muted">h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ul className="hidden gap-x-6 gap-y-2 sm:grid sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.12em] text-muted"
              >
                <span className="mt-1 h-1 w-1 shrink-0 bg-accent" />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
          <div className="w-full max-w-[430px]">
            <div className="flex items-center justify-between gap-3">
              <SectionLabel index="02">Crew sign-in</SectionLabel>
              <span className="border border-line px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-muted">
                Frontend only
              </span>
            </div>
            <h2 className="mt-4 font-display text-[30px] font-semibold leading-none tracking-[-0.03em] sm:text-[36px]">
              Sign in.
            </h2>
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              Authorize a demonstration session to enter mission control. This
              gate is visual only and is not a security boundary.
            </p>

            <div className="mt-5 border border-warn/60 bg-accentsoft p-3">
              <div className="flex items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.16em] text-crit">
                <AlertTriangle size={12} />
                Demonstration interface
              </div>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
                No backend, external identity provider, or real user accounts.
                The demo session is stored in this browser only.
              </p>
            </div>

            <form className="mt-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="demo-email"
                  className="label block"
                >
                  Email address
                </label>
                <input
                  id="demo-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (fieldErrors.email) {
                      setFieldErrors((current) => ({
                        ...current,
                        email: undefined,
                      }))
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? 'demo-email-error' : undefined
                  }
                  className={cn(
                    'mt-2 h-11 w-full border bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink',
                    fieldErrors.email ? 'border-crit' : 'border-line',
                  )}
                  placeholder="demo@astrovital.space"
                />
                {fieldErrors.email && (
                  <p
                    id="demo-email-error"
                    className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-crit"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="demo-password" className="label block">
                    Password
                  </label>
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                    Case sensitive
                  </span>
                </div>
                <div className="relative mt-2">
                  <input
                    id="demo-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      if (fieldErrors.password) {
                        setFieldErrors((current) => ({
                          ...current,
                          password: undefined,
                        }))
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? 'demo-password-error' : undefined
                    }
                    className={cn(
                      'h-11 w-full border bg-surface pl-3 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink',
                      fieldErrors.password ? 'border-crit' : 'border-line',
                    )}
                    placeholder="Enter demo password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-ink"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p
                    id="demo-password-error"
                    className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-crit"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#FF5038]"
                />
                <span>
                  <span className="block text-[11px] font-medium text-ink">
                    Remember me on this device
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-muted">
                    Keeps the demo session after the browser closes. Without it,
                    refresh works but a new browser session requires sign-in.
                  </span>
                </span>
              </label>

              {formError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 border border-crit/60 bg-accentsoft p-3"
                >
                  <AlertTriangle
                    size={14}
                    className="mt-0.5 shrink-0 text-crit"
                  />
                  <p className="text-[10.5px] leading-relaxed text-crit">
                    {formError}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                icon={<LogIn size={14} />}
                className="mt-5 h-11 w-full tracking-[0.18em]"
              >
                Sign in to mission control
              </Button>
            </form>

            <div className="mt-6 border border-line bg-surface p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SectionLabel index="03">Demo access pass</SectionLabel>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
                >
                  Use credentials
                  <ArrowRight size={11} />
                </button>
              </div>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
                    Email
                  </dt>
                  <dd className="mt-1 break-all font-mono text-[10.5px] text-ink">
                    {DEMO_EMAIL}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
                    Password
                  </dt>
                  <dd className="mt-1 break-all font-mono text-[10.5px] text-ink">
                    {DEMO_PASSWORD}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="mt-4 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-muted">
              AstroVital is a fictional demonstration · No NASA affiliation ·
              Not a medical device
            </p>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 border-t border-line px-4 py-4 font-mono text-[8px] uppercase tracking-[0.16em] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <span>AstroVital · Demo access · Simulated telemetry</span>
        <span>
          Session stored locally ·{' '}
          <span className="text-accent">Space Apps concept</span>
        </span>
      </footer>

      <ToastViewport />
    </div>
  )
}
