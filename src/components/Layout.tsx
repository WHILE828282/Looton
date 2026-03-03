import { Link, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/AppContext'

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/orders', label: 'Orders', icon: '📦' },
  { to: '/sell', label: 'Sell', icon: '🛍️' },
  { to: '/disputes', label: 'Disputes', icon: '⚖️' },
  { to: '/profile', label: 'Profile', icon: '👤' }
]

export const Layout = () => {
  const location = useLocation()
  const { user } = useApp()

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="topbar-eyebrow">eldarado.gg style marketplace</p>
          <h1 className="topbar-title">Looton Portal</h1>
        </div>
        <div className="topbar-actions">
          <Link className="topbar-badge" to="/messages">Chat</Link>
          <span className="topbar-badge">Balance: {user.depositTon.toFixed(2)} TON</span>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {tabs.map((tab) => {
          const active = location.pathname === tab.to
          return (
            <Link key={tab.to} className={active ? 'tab active' : 'tab'} to={tab.to}>
              <span className="tab-icon" aria-hidden>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
