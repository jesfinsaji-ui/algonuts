import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { AppLayout } from './components/layout/AppLayout'
import { ThemeProvider } from './context/ThemeContext'
import { Alerts } from './pages/Alerts'
import { Analytics } from './pages/Analytics'
import { AstronautProfile } from './pages/AstronautProfile'
import { Crew } from './pages/Crew'
import { History } from './pages/History'
import { Login } from './pages/Login'
import { NotFound } from './pages/NotFound'
import { Overview } from './pages/Overview'
import { RiskAnalysis } from './pages/RiskAnalysis'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Overview />} />
              <Route path="crew" element={<Crew />} />
              <Route path="crew/:id" element={<AstronautProfile />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="risk" element={<RiskAnalysis />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
