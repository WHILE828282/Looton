import { useMemo, type ReactElement } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { SvgSprite } from '../icons/SvgSprite'
import { ChatsIcon, DisputesIcon, MarketIcon, OrdersIcon, ProfileIcon, QueueIcon, SellIcon, TonIcon } from '../icons1/UiIcons'

type IconName = 'market' | 'orders' | 'sell' | 'profile' | 'disputes' | 'queue' | 'chats'

const NavIcon = ({ name }: { name: IconName }) => {
  const map: Record<IconName, ReactElement> = {
    market: <MarketIcon />,
    orders: <OrdersIcon />,
    sell: <SellIcon />,
    disputes: <DisputesIcon />,
    queue: <QueueIcon />,
    chats: <ChatsIcon />,
    profile: <ProfileIcon />
  }

  return map[name]
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
  const isOfferScreen = location.pathname.startsWith('/offer/')
  const isOrderChatScreen = /^\/order\/[^/]+\/chat\/?$/.test(location.pathname) || (location.pathname.startsWith('/order/') && location.pathname.includes('/chat'))
  const isFullscreenScreen = isOfferScreen || isOrderChatScreen

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
      {!isFullscreenScreen && (
        <header className="topbar">
          <div>
            <p className="topbar-eyebrow">secure gaming marketplace</p>
            <h1 className="topbar-title">Looton Market</h1>
          </div>
          <div className="topbar-actions">
            <Link className="topbar-badge" to="/chats">Chat</Link>
            <span className="topbar-badge topbar-balance"><span>Balance:</span><TonIcon className="topbar-ton-icon" /><span>{user.depositTon.toFixed(2)}</span></span>
          </div>
        </header>
      )}

      <main className="main">
        <Outlet />
      </main>

      {!isFullscreenScreen && (
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
      )}
    </div>
  )
}
