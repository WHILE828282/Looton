import { Link, Outlet, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home' },
  { to: '/orders', label: 'Orders' },
  { to: '/sell', label: 'Sell' },
  { to: '/disputes', label: 'Disputes' },
  { to: '/profile', label: 'Profile' }
]

export const Layout = () => {
  const location = useLocation()
  return (
    <div className="app">
      <main className="main"><Outlet /></main>
      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <Link key={tab.to} className={location.pathname === tab.to ? 'tab active' : 'tab'} to={tab.to}>
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
