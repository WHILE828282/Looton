import { useMemo } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/AppContext'

type IconName = 'market' | 'orders' | 'sell' | 'profile' | 'disputes' | 'queue' | 'chats'

const NavIcon = ({ name }: { name: IconName }) => {
  if (name === 'market') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/>
        <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/>
        <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/>
      </svg>
    )
  }

  if (name === 'orders') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"/>
        <path d="m3.3 7 8.7 5 8.7-5"/>
        <path d="M12 22V12"/>
      </svg>
    )
  }

  if (name === 'sell') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
        <path d="M3 6h18"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    )
  }

  if (name === 'disputes') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m16 16 3 3 3-3"/>
        <path d="M19 13v6"/>
        <path d="M5 8h14"/>
        <path d="M7 8c0-1.7.7-3 2-4"/>
        <path d="M17 8c0-1.7-.7-3-2-4"/>
        <path d="M9 8v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8"/>
      </svg>
    )
  }

  if (name === 'queue') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10"/>
        <path d="m12 6 4 6-4 6-4-6 4-6z"/>
      </svg>
    )
  }

  if (name === 'chats') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4"/>
      <path d="M6 20a6 6 0 0 1 12 0"/>
    </svg>
  )
}

const userTabs = [
  { to: '/', label: 'Market', icon: 'market' as const },
  { to: '/orders', label: 'Orders', icon: 'orders' as const },
  { to: '/sell', label: 'Sell', icon: 'sell' as const }
]

const arbTabs = [
  { to: '/disputes', label: 'Disputes', icon: 'disputes' as const },
  { to: '/staff', label: 'Queue', icon: 'queue' as const },
  { to: '/chats', label: 'Chats', icon: 'chats' as const },
  { to: '/profile', label: 'Profile', icon: 'profile' as const }
]

const SvgSprite = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="svg-sprite" aria-hidden>
    <symbol id="i-attach" viewBox="0 0 24 24">
      <path d="M21.44 11.05l-8.49 8.49a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.19 9.19a2 2 0 0 1-2.83-2.83l8.49-8.49" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </symbol>
    <symbol id="i-send" viewBox="0 0 24 24">
      <path d="M22 2L11 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </symbol>
    <symbol id="i-more" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1" fill="currentColor"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <circle cx="12" cy="19" r="1" fill="currentColor"/>
    </symbol>
    <symbol id="i-bell" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 17a3 3 0 0 0 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </symbol>
    <symbol id="i-bell-off" viewBox="0 0 24 24">
      <path d="M10.5 5a2 2 0 0 1 3 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 8a6 6 0 0 0-9.33-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.26 6.26A6 6 0 0 0 6 8c0 7-3 7-3 7h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 17a3 3 0 0 0 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </symbol>
    <symbol id="i-bell-dot" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 17a3 3 0 0 0 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18.5" cy="5.5" r="2" fill="currentColor"/>
    </symbol>

    <symbol id="i-bell-ring" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 17a3 3 0 0 0 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 8c-.3-1.4.1-3 1.1-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 8c.3-1.4-.1-3-1.1-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </symbol>
    <symbol id="i-lock" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </symbol>
    <symbol id="i-check" viewBox="0 0 24 24">
      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </symbol>
    <symbol id="i-chat" viewBox="0 0 24 24">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </symbol>
    <symbol id="i-dots" viewBox="0 0 24 24">
      <path d="M12 12h.01" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <path d="M19 12h.01" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <path d="M5 12h.01" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </symbol>
  </svg>
)

const isTabActive = (pathname: string, to: string, isArbitrator: boolean) => {
  if (to === '/') {
    if (isArbitrator) return pathname === '/'
    return !pathname.startsWith('/orders') && !pathname.startsWith('/sell') && !pathname.startsWith('/profile')
  }

  return pathname === to || pathname.startsWith(`${to}/`)
}

export const Layout = () => {
  const location = useLocation()
  const { user } = useApp()

  const isArbitrator = ['trainee_arb', 'arb', 'senior_arb', 'admin'].includes(user.role)
  const tabs = isArbitrator ? arbTabs : userTabs
  const avatarLetter = (user.username?.[0] ?? 'U').toUpperCase()

  const tgAvatarUrl = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return (window as Window & {
      Telegram?: { WebApp?: { initDataUnsafe?: { user?: { photo_url?: string } } } }
    }).Telegram?.WebApp?.initDataUnsafe?.user?.photo_url
  }, [])

  return (
    <div className="app">
      <SvgSprite />
      <header className="topbar">
        <div>
          <p className="topbar-eyebrow">secure gaming marketplace</p>
          <h1 className="topbar-title">Looton Market</h1>
        </div>
        <div className="topbar-actions">
          <Link className="topbar-badge" to="/chats">Chat</Link>
          <span className="topbar-badge">Balance: {user.depositTon.toFixed(2)} TON</span>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <nav className={isArbitrator ? 'bottom-nav' : 'bottom-nav portals'}>
        {tabs.map((tab) => {
          const active = isTabActive(location.pathname, tab.to, isArbitrator)
          return (
            <Link key={tab.to} className={active ? 'tab active' : 'tab'} to={tab.to}>
              <span className="tab-icon" aria-hidden><NavIcon name={tab.icon} /></span>
              <span>{tab.label}</span>
            </Link>
          )
        })}

        {!isArbitrator && (
          <Link className="tg-avatar-btn" to="/profile" aria-label="Open profile">
            {tgAvatarUrl
              ? <img className="tg-avatar" src={tgAvatarUrl} alt="Telegram avatar" />
              : <span className="tg-avatar tg-avatar-fallback">{avatarLetter}</span>}
          </Link>
        )}
      </nav>
    </div>
  )
}
