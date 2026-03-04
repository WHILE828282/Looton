import { Link, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/AppContext'

const userTabs = [
  { to: '/', label: 'Market', icon: '🏪' },
  { to: '/orders', label: 'Orders', icon: '📦' },
  { to: '/sell', label: 'Sell', icon: '🪙' }
]

const arbTabs = [
  { to: '/disputes', label: 'Disputes', icon: '⚖️' },
  { to: '/staff', label: 'Queue', icon: '🧭' },
  { to: '/chats', label: 'Chats', icon: '💬' },
  { to: '/profile', label: 'Profile', icon: '👤' }
]

export const Layout = () => {
  const location = useLocation()
  const { user } = useApp()

  const isArbitrator = ['trainee_arb', 'arb', 'senior_arb', 'admin'].includes(user.role)
  const tabs = isArbitrator ? arbTabs : userTabs
  const avatarLetter = (user.username?.[0] ?? 'U').toUpperCase()

  return (
    <div className="app">
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
          const active = location.pathname === tab.to
          return (
            <Link key={tab.to} className={active ? 'tab active' : 'tab'} to={tab.to}>
              <span className="tab-icon" aria-hidden>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}

        {!isArbitrator && (
          <Link className="tg-avatar-btn" to="/profile" aria-label="Open profile">
            <span className="tg-avatar">{avatarLetter}</span>
          </Link>
        )}
      </nav>
    </div>
  )
}
