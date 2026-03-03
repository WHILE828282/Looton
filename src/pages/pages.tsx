import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TonConnectButton } from '@tonconnect/ui-react'
import { Card } from '../components/Card'
import { categories, DEPOSIT_THRESHOLD, games } from '../lib/mockData'
import { canOpenDispute, calcFee, isCompletedStatus, payoutBadge } from '../lib/domain'
import { useApp } from '../lib/AppContext'
import type { ChatMessage, Offer, OfferCategory, OfferDeliveryType, OfferPayoutPolicy, OrderStatus, Role } from '../types'

type SellForm = {
  gameId: string
  category: OfferCategory
  title: string
  description: string
  priceTon: number
  deliveryType: OfferDeliveryType
  payoutPolicy: OfferPayoutPolicy
}



const DISPUTE_POLICY = `🔒 Политика разрешения споров и обжалования (Looton)

📌 Что произойдет, если будет открыт спор?

Если по вашему заказу открыт спор:
• Сделка немедленно замораживается.
• Средства остаются в безопасности на эскроу-счете.
• К делу назначается независимый арбитр Looton.
• Обе стороны должны предоставить доказательства (скриншоты, ID транзакций, историю чата и подтверждение доставки).

⚠️ Важно: Если продавец не выполнил заказ, не отменяйте спор до решения арбитра.`

const COMPLETE_ORDER_WARNING = `⚠️ Подтвердите завершение заказа

Вы уверены, что хотите подтвердить эту покупку?

После подтверждения:
• Эскроу-защита прекращается
• Средства будут перечислены продавцу
• Вы не сможете открыть спор по этому заказу

Если вы не получили товар или услугу в полном объеме — НЕ подтверждайте заказ.`

const CANCEL_DISPUTE_WARNING = `⚠️ Хотите отменить спор?

Вы уверены, что хотите отменить этот спор?

После отмены:
• Защита депонирования средств прекратится
• Средства могут быть переданы контрагенту
• Дело может быть не возобновлено

Если проблема не решена — не отменяйте спор.`

const APPEAL_CONFIRM_STEPS = [
  'Шаг 1/3: Подтвердите, что прочитали правила спора и арбитража.',
  'Шаг 2/3: Подтвердите, что понимаете последствия обжалования.',
  'Шаг 3/3: Финальное подтверждение отправки апелляции.'
]

const statusTone: Record<OrderStatus, 'neutral' | 'ok' | 'warn' | 'danger'> = {
  created: 'neutral',
  paid: 'neutral',
  delivering: 'warn',
  delivered: 'warn',
  confirmed: 'ok',
  auto_confirmed: 'ok',
  disputed: 'danger',
  resolved_buyer: 'ok',
  resolved_seller: 'ok',
  cancelled: 'danger'
}

const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`badge ${statusTone[status]}`}>{status.replace('_', ' ')}</span>
)

const formatLeftMinutes = (confirmUntil: number) => {
  const left = Math.max(0, Math.floor((confirmUntil - Date.now()) / 1000 / 60))
  return `${left}m`
}


const gameIconSrc = (gameId?: string) => games.find((g) => g.id === gameId)?.iconUrl ?? '/icon.svg'

const iconCandidates = (src: string) => {
  const normalized = src.trim()
  const candidates = [normalized]

  if (normalized.endsWith('.jpg')) {
    candidates.push(normalized.replace(/\.jpg$/, '.jpeg'))
  } else if (normalized.endsWith('.jpeg')) {
    candidates.push(normalized.replace(/\.jpeg$/, '.jpg'))
  }

  if (normalized.includes('/cover.')) {
    candidates.push(normalized.replace(/\/cover\.(jpg|jpeg)$/, '.svg'))
  }

  candidates.push('/icon.svg')

  return [...new Set(candidates)]
}

const GameIcon = ({ src, alt }: { src: string; alt: string }) => {
  const candidates = useMemo(() => iconCandidates(src), [src])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [src])

  return (
    <img
      className="game-icon"
      src={candidates[Math.min(index, candidates.length - 1)]}
      alt={alt}
      loading="lazy"
      onError={() => {
        setIndex((current) => {
          if (current >= candidates.length - 1) return current
          return current + 1
        })
      }}
    />
  )
}

const OfferRow = ({ offer }: { offer: Offer }) => (
  <Link to={`/offer/${offer.id}`} className="row">
    <strong>{offer.title}</strong>
    <span>{offer.priceTon} TON</span>
    <small>{payoutBadge(offer)} · ⭐ {offer.sellerStats.rating} · {offer.sellerStats.depositTon} TON deposit</small>
  </Link>
)

export const HomePage = () => {
  const { offers } = useApp()
  const trending = offers.slice(0, 6)
  const trustStats = [
    { label: 'Deals 24h', value: '1,200+' },
    { label: 'Verified sellers', value: '340+' },
    { label: 'Avg delivery', value: '8m' }
  ]
  const popularAccounts = games.map((g) => ({
    id: g.id,
    title: `${g.title} Accounts`,
    to: `/game/${g.id}`,
    iconUrl: g.iconUrl
  }))
  const popularCurrencies = games.map((g) => ({
    id: `${g.id}-currency`,
    title: `${g.title} Currency`,
    to: `/game/${g.id}/offers/currency`,
    iconUrl: g.iconUrl
  }))
  const popularServices = games.map((g) => ({
    id: `${g.id}-service`,
    title: `${g.title} Boosting`,
    to: `/game/${g.id}/offers/services`,
    iconUrl: g.iconUrl
  }))
  const popularItems = offers.map((o) => ({
    id: `${o.id}-item`,
    title: o.title,
    to: `/offer/${o.id}`,
    iconUrl: gameIconSrc(o.gameId)
  }))

  return (
    <div className="stack">
      <input className="input" placeholder="Search games, offers, sellers" />

      <Card>
        <div className="market-stats">
          {trustStats.map((stat) => (
            <div key={stat.label} className="stat-cell">
              <strong>{stat.value}</strong>
              <small>{stat.label}</small>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3>Trending 🔥</h3>
        <div className="trending-scroll">
          {trending.map((offer) => {
            const iconSrc = gameIconSrc(offer.gameId)
            const game = games.find((g) => g.id === offer.gameId)
            return (
              <Link key={offer.id} className="trending-item" to={`/offer/${offer.id}`}>
                <GameIcon src={iconSrc} alt={game?.title ?? 'Game'} />
                <span>{offer.title}</span>
              </Link>
            )
          })}
        </div>
      </Card>

      <div className="portal-grid">
        <Card>
          <h3>Popular Accounts</h3>
          <div className="portal-list">
            {popularAccounts.map((item) => (
              <Link key={item.id} className="portal-link" to={item.to}>
                <GameIcon src={item.iconUrl ?? '/icon.svg'} alt={item.title} />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h3>Popular Currencies</h3>
          <div className="portal-list">
            {popularCurrencies.map((item) => (
              <Link key={item.id} className="portal-link" to={item.to}>
                <GameIcon src={item.iconUrl ?? '/icon.svg'} alt={item.title} />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="portal-grid">
        <Card>
          <h3>Popular Boosting Services</h3>
          <div className="portal-list">
            {popularServices.map((item) => (
              <Link key={item.id} className="portal-link" to={item.to}>
                <GameIcon src={item.iconUrl ?? '/icon.svg'} alt={item.title} />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h3>Popular Items</h3>
          <div className="portal-list">
            {popularItems.slice(0, 4).map((item) => (
              <Link key={item.id} className="portal-link" to={item.to}>
                <GameIcon src={item.iconUrl} alt={item.title} />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3>Categories</h3>
        <div className="portal-list">
          {categories.map((c) => {
            const game = games[categories.indexOf(c) % games.length]
            return (
              <Link key={c} className="portal-link" to={`/game/${game.id}/offers/${c}`}>
                <GameIcon src={game.iconUrl ?? '/icon.svg'} alt={c} />
                <span>{c}</span>
              </Link>
            )
          })}
        </div>
      </Card>

      <Card>
        <h3>New offers</h3>
        {offers.slice(0, 6).map((o) => <OfferRow key={o.id} offer={o} />)}
      </Card>
    </div>
  )
}

export const GamePage = () => {
  const { gameId = '' } = useParams()
  const game = games.find((g) => g.id === gameId)

  if (!game) return <p>Game not found</p>

  return (
    <div className="stack">
      <h2>{game.title} Market</h2>
      <div className="chips">{game.tags.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
      <Card>
        <h3>Categories</h3>
        {categories.map((c) => (
          <Link className="portal-link" key={c} to={`/game/${game.id}/offers/${c}`}>
            <GameIcon src={game.iconUrl ?? '/icon.svg'} alt={game.title} />
            <span>{c}</span>
          </Link>
        ))}
      </Card>
    </div>
  )
}

export const OffersPage = () => {
  const { offers } = useApp()
  const { gameId, category } = useParams()
  const [instantOnly, setInstantOnly] = useState(false)
  const [depositOnly, setDepositOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'best' | 'price_asc' | 'price_desc' | 'rating'>('best')

  const filtered = useMemo(() => {
    const base = offers.filter((o) => o.gameId === gameId && o.category === category)
    const withFilters = base.filter((o) => {
      if (instantOnly && o.deliveryType !== 'instant') return false
      if (depositOnly && o.sellerStats.depositTon < DEPOSIT_THRESHOLD) return false
      return true
    })

    return [...withFilters].sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceTon - b.priceTon
      if (sortBy === 'price_desc') return b.priceTon - a.priceTon
      if (sortBy === 'rating') return b.sellerStats.rating - a.sellerStats.rating

      if (b.sellerStats.depositTon !== a.sellerStats.depositTon) {
        return b.sellerStats.depositTon - a.sellerStats.depositTon
      }
      if (b.sellerStats.rating !== a.sellerStats.rating) {
        return b.sellerStats.rating - a.sellerStats.rating
      }
      return a.priceTon - b.priceTon
    })
  }, [offers, gameId, category, instantOnly, depositOnly, sortBy])

  return (
    <div className="stack">
      <Card>
        <h3>Live offers for {category}</h3>
        <p>Compare seller score, payout policy and delivery speed before purchase.</p>
      </Card>
      <div className="chips offer-filters">
        <button className={`chip ${depositOnly ? 'active' : ''}`} onClick={() => setDepositOnly((v) => !v)}>Deposit only</button>
        <button className={`chip ${instantOnly ? 'active' : ''}`} onClick={() => setInstantOnly((v) => !v)}>Instant delivery</button>
        <button className={`chip ${sortBy === 'best' ? 'active' : ''}`} onClick={() => setSortBy('best')}>Best match</button>
        <button className={`chip ${sortBy === 'price_asc' ? 'active' : ''}`} onClick={() => setSortBy('price_asc')}>Price ↑</button>
        <button className={`chip ${sortBy === 'price_desc' ? 'active' : ''}`} onClick={() => setSortBy('price_desc')}>Price ↓</button>
        <button className={`chip ${sortBy === 'rating' ? 'active' : ''}`} onClick={() => setSortBy('rating')}>Top rated</button>
      </div>
      <Card>
        {filtered.length ? filtered.map((o) => (
          <Link key={o.id} to={`/offer/${o.id}`} className="row">
            <strong>{o.title}</strong>
            <small className="offer-meta">
              ⭐ {o.sellerStats.rating} · {o.deliveryType} · {payoutBadge(o)} · Deposit {o.sellerStats.depositTon} TON
            </small>
            <span>{o.priceTon} TON</span>
          </Link>
        )) : <p>No offers yet</p>}
      </Card>
    </div>
  )
}

export const OfferDetailsPage = () => {
  const { offers } = useApp()
  const { offerId = '' } = useParams()
  const offer = offers.find((o) => o.id === offerId)

  if (!offer) return <p>Offer not found</p>

  return (
    <div className="stack">
      <h2>{offer.title}</h2>
      <Card>
        <p>{offer.description}</p>
        <p>{offer.rules.warrantyText}</p>
        <p>Delivery type: {offer.deliveryType}</p>
        <p>Payout: {offer.payoutPolicy}</p>
      </Card>
      <Card>
        <p>Seller ⭐ {offer.sellerStats.rating} · Deals {offer.sellerStats.deals}</p>
        <p>Deposit {offer.sellerStats.depositTon} TON</p>
      </Card>
      <Link className="btn" to={`/checkout/${offer.id}`}>Buy</Link>
    </div>
  )
}

export const CheckoutPage = () => {
  const { offers, createOrder } = useApp()
  const { offerId = '' } = useParams()
  const nav = useNavigate()
  const offer = offers.find((o) => o.id === offerId)
  const [connected, setConnected] = useState(false)

  if (!offer) return <p>Offer not found</p>

  const fee = calcFee(offer.priceTon)
  const total = offer.priceTon + fee

  return (
    <div className="stack">
      <Card>
        <p>Amount {offer.priceTon} TON</p>
        <p>Fee (5%) {fee} TON</p>
        <h3>Total {total} TON</h3>
      </Card>
      <TonConnectButton />
      <button className="btn secondary" onClick={() => setConnected(true)}>Simulate wallet connected</button>
      {connected && <button className="btn" onClick={() => nav(`/order/${createOrder(offer).id}`)}>Pay via escrow</button>}
    </div>
  )
}

export const OrdersPage = () => {
  const { orders, offers, user } = useApp()
  const [mode, setMode] = useState<'buyer' | 'seller'>('buyer')
  const [tab, setTab] = useState<'active' | 'completed'>('active')

  const modeOrders = orders.filter((o) => (mode === 'buyer' ? o.buyerId === user.id : o.sellerId === user.id))
  const view = modeOrders.filter((o) => (tab === 'active' ? !isCompletedStatus(o.status) : isCompletedStatus(o.status)))

  return (
    <div className="stack">
      <div className="chips">
        <button className="chip" onClick={() => setMode('buyer')}>Buyer</button>
        <button className="chip" onClick={() => setMode('seller')}>Seller</button>
        <button className="chip" onClick={() => setTab('active')}>Active</button>
        <button className="chip" onClick={() => setTab('completed')}>Completed</button>
      </div>
      <Card>
        {view.length ? view.map((o) => (
          <Link key={o.id} className="row" to={`/order/${o.id}`}>
            {offers.find((f) => f.id === o.offerId)?.title ?? o.offerId}
            <small>{mode} · <StatusBadge status={o.status} /> · {o.amountTon} TON</small>
          </Link>
        )) : <p>No orders in this view</p>}
      </Card>
    </div>
  )
}

export const OrderDetailsPage = () => {
  const { orderId = '' } = useParams()
  const { user, orders, offers, updateOrder, openDispute } = useApp()
  const nav = useNavigate()
  const order = orders.find((o) => o.id === orderId)

  if (!order) return <p>Order not found</p>

  const offer = offers.find((o) => o.id === order.offerId)
  const canDispute = canOpenDispute(order)
  const isBuyer = user.id === order.buyerId
  const isSeller = user.id === order.sellerId

  return (
    <div className="stack">
      <h3>{offer?.title}</h3>
      <Card>
        <p>Status: <StatusBadge status={order.status} /></p>
        <p>Confirm in: {formatLeftMinutes(order.timers.confirmUntil)}</p>
        <ol className="timeline">
          <li>Created</li>
          <li>Paid (escrow)</li>
          <li>Delivered</li>
          <li>Confirmed / Auto-confirmed / Disputed</li>
        </ol>
      </Card>

      <Link className="btn secondary" to={`/order/${order.id}/chat`}>Open order chat</Link>

      {isSeller && <button className="btn" onClick={() => updateOrder(order.id, { status: 'delivered' })}>Mark delivered</button>}
      {isBuyer && <button className="btn" onClick={() => {
        if (!window.confirm(COMPLETE_ORDER_WARNING)) return
        updateOrder(order.id, { status: 'confirmed', closedAt: Date.now() })
      }}>Confirm received</button>}
      {canDispute && (
        <button
          className="btn secondary"
          onClick={() => {
            if (!window.confirm(DISPUTE_POLICY)) return
            nav(`/dispute/${openDispute(order.id, 'Need arbitration', isBuyer ? 'buyer' : 'seller').id}`)
          }}
        >
          Open dispute
        </button>
      )}
      <button className="btn secondary" onClick={() => updateOrder(order.id, { status: 'auto_confirmed', closedAt: Date.now() })}>
        Trigger auto confirm
      </button>
    </div>
  )
}

export const ChatPage = () => {
  const { orderId = '' } = useParams()
  const { user, orders, offers, chatMessages, sendOrderMessage } = useApp()
  const [draft, setDraft] = useState('')
  const order = orders.find((o) => o.id === orderId)

  if (!order) return <p>Order not found</p>

  const offer = offers.find((item) => item.id === order.offerId)
  const sender: ChatMessage['sender'] = user.id === order.sellerId ? 'seller' : 'buyer'
  const paidStatuses: OrderStatus[] = [
    'paid',
    'delivering',
    'delivered',
    'confirmed',
    'auto_confirmed',
    'disputed',
    'resolved_buyer',
    'resolved_seller'
  ]
  const isOrderPaid = Boolean(order.paidAt) || paidStatuses.includes(order.status)
  const messages = chatMessages
    .filter((m) => m.orderId === order.id)
    .filter((m) => {
      if (m.sender !== 'system') return true
      if (!m.text.includes('успешно оплатил заказ')) return true
      return isOrderPaid
    })
    .sort((a, b) => a.createdAt - b.createdAt)

  const sellerName = `seller_${order.sellerId}`
  const peerName = sender === 'buyer' ? sellerName : `buyer_${order.buyerId}`
  const peerSubtitle = sender === 'buyer' ? 'Продавец онлайн' : 'Покупатель онлайн'

  const roomList = [
    {
      id: order.id,
      title: peerName,
      preview: (messages.length ? messages[messages.length - 1].text : 'Нет сообщений'),
      active: true
    },
    {
      id: 'demo-1',
      title: 'support_looton',
      preview: 'Официальные уведомления платформы',
      active: false
    },
    {
      id: 'demo-2',
      title: 'fast_seller',
      preview: 'Отправил детали по заказу',
      active: false
    }
  ]

  return (
    <div className="chat-shell">
      <aside className="chat-sidebar card">
        <h2>Сообщения</h2>
        <div className="chat-room-list">
          {roomList.map((room) => (
            <button key={room.id} className={room.active ? 'chat-room active' : 'chat-room'}>
              <span className="chat-room-title">{room.title}</span>
              <small>{room.preview}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-main card">
        <header className="chat-header">
          <div>
            <strong>{peerName}</strong>
            <small>{peerSubtitle}</small>
          </div>
          <div className="chat-header-actions">
            <button className="chip">🔔 Уведомления</button>
            <button className="chip">⋯</button>
          </div>
        </header>

        <div className="chat-list">
          {messages.length ? messages.map((message) => (
            <div key={message.id} className={`chat-bubble ${message.sender}`}>
              <small>
                {message.sender === 'system' ? 'Система' : message.sender === 'buyer' ? 'Покупатель' : 'Продавец'}
                {' · '}
                {new Date(message.createdAt).toLocaleString()}
              </small>
              <p>{message.text}</p>
            </div>
          )) : <p>Чат пока пуст.</p>}
        </div>

        <div className="chat-composer">
          <textarea
            className="input"
            placeholder="Написать сообщение..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            className="btn"
            onClick={() => {
              sendOrderMessage(order.id, sender, draft)
              setDraft('')
            }}
          >
            ➤
          </button>
        </div>
      </section>

      <aside className="chat-meta card">
        <h3>Детали сделки</h3>
        <p>Оффер: {offer?.title ?? order.offerId}</p>
        <p>Сумма: {order.amountTon} TON</p>
        <p>Статус: {order.status}</p>
        {!isOrderPaid && <p className="chat-warning">Заказ еще не оплачен — сообщение об успешной оплате не показывается.</p>}
        <p>Escrow: активен до завершения заказа.</p>
        <p>Никогда не переводите средства вне платформы.</p>
      </aside>
    </div>
  )
}

export const SellPage = () => {

  const { offers, user } = useApp()
  const myOffers = offers.filter((o) => o.sellerId === user.id)

  return <div className="stack"><Link className="btn" to="/sell/new">Create offer</Link><Card>{myOffers.length ? myOffers.map((o) => <OfferRow key={o.id} offer={o} />) : <p>No offers yet</p>}</Card></div>
}

export const SellNewPage = () => {
  const { addOffer, user } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState<SellForm>({
    gameId: games[0].id,
    category: categories[0],
    title: '',
    description: '',
    priceTon: 1,
    deliveryType: 'instant',
    payoutPolicy: 'instant_if_deposit'
  })

  return (
    <div className="stack">
      <h3>Create Offer Wizard</h3>
      <select className="input" value={form.gameId} onChange={(e) => setForm({ ...form, gameId: e.target.value })}>{games.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select>
      <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as OfferCategory })}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
      <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input className="input" type="number" min="1" value={form.priceTon} onChange={(e) => setForm({ ...form, priceTon: Number(e.target.value) })} />
      <select className="input" value={form.deliveryType} onChange={(e) => setForm({ ...form, deliveryType: e.target.value as OfferDeliveryType })}>
        <option value="instant">instant</option>
        <option value="manual">manual</option>
      </select>
      <select className="input" value={form.payoutPolicy} onChange={(e) => setForm({ ...form, payoutPolicy: e.target.value as OfferPayoutPolicy })}>
        <option value="instant_if_deposit">instant_if_deposit</option>
        <option value="hold_24h">hold_24h</option>
      </select>
      <button
        className="btn"
        onClick={() => {
          addOffer({
            id: `off-${Date.now()}`,
            gameId: form.gameId,
            category: form.category,
            title: form.title || 'Untitled offer',
            description: form.description || '-',
            priceTon: form.priceTon,
            deliveryType: form.deliveryType,
            payoutPolicy: form.payoutPolicy,
            sellerId: user.id,
            sellerStats: { rating: user.sellerRating, deals: user.dealsCount, depositTon: user.depositTon },
            rules: { autoCloseHours: 24, warrantyText: 'Basic warranty applies.' },
            createdAt: Date.now()
          })
          nav('/sell')
        }}
      >
        Publish
      </button>
    </div>
  )
}

export const DisputesPage = () => {
  const { disputes, orders, user } = useApp()
  const mine = disputes.filter((d) => {
    const order = orders.find((o) => o.id === d.orderId)
    return order ? order.buyerId === user.id || order.sellerId === user.id : true
  })

  return <div className="stack"><Card>{mine.map((d) => <Link className="row" to={`/dispute/${d.id}`} key={d.id}>{d.reasonCode}<small>{d.status}</small></Link>)}</Card></div>
}

export const DisputeDetailsPage = () => {
  const { disputeId = '' } = useParams()
  const { disputes, appealDispute, cancelDispute } = useApp()
  const d = disputes.find((x) => x.id === disputeId)

  if (!d) return <p>Not found</p>

  const canAppeal = ['trainee_decided', 'arb_decided'].includes(d.status) && d.appealCount < 1
  const canCancel = ['opened', 'assigned_trainee', 'escalated_to_arb', 'escalated_to_senior'].includes(d.status)

  return (
    <div className="stack">
      <Card>
        <p>Reason: {d.reasonCode}</p>
        <p>{d.message}</p>
        <p>Status: {d.status}</p>
        {d.decision && <p>Decision: {d.decision.text}</p>}
      </Card>
      <Card>
        <h4>Timeline</h4>
        <p>opened → assigned → decision → escalations</p>
        {d.decision && <p>Winner: {d.decision.winner}</p>}
      </Card>
      {canAppeal && <button className="btn secondary" onClick={() => {
        if (!window.confirm(DISPUTE_POLICY)) return
        for (const step of APPEAL_CONFIRM_STEPS) {
          if (!window.confirm(step)) return
        }
        appealDispute(d.id)
      }}>Appeal</button>}
      {canCancel && <button className="btn secondary" onClick={() => {
        if (!window.confirm(CANCEL_DISPUTE_WARNING)) return
        cancelDispute(d.id)
      }}>Cancel dispute</button>}
    </div>
  )
}

export const ProfilePage = () => {

  const { user, setUser } = useApp()
  const roles: Role[] = ['user', 'seller', 'trainee_arb', 'arb', 'senior_arb', 'admin']

  return (
    <div className="stack">
      <Card><p>@{user.username}</p><p>Role: {user.role}</p><p>Buyer {user.buyerRating} · Seller {user.sellerRating}</p></Card>
      <Card><p>Deposit {user.depositTon} TON ({user.depositStatus})</p><Link to="/deposit">Manage deposit</Link></Card>
      <Card>
        <p>Role switch (MVP debug)</p>
        <select className="input" value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value as Role })}>
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
      </Card>
    </div>
  )
}

export const DepositPage = () => {
  const { user, setUser } = useApp()
  const eligible = user.depositStatus === 'active' && user.depositTon >= DEPOSIT_THRESHOLD
  const cooldownLeft = user.withdrawalRequestedAt ? Math.max(0, 24 - Math.floor((Date.now() - user.withdrawalRequestedAt) / 36e5)) : 0

  return (
    <div className="stack">
      <Card>
        <h3>{user.depositTon} TON</h3>
        <p>Instant payout eligibility: {eligible ? 'Yes' : 'No'}</p>
        <p>Cooldown: {user.depositStatus === 'withdrawal_pending' ? `${cooldownLeft}h left` : 'none'}</p>
      </Card>
      <button className="btn" onClick={() => setUser({ ...user, depositTon: user.depositTon + 10, depositStatus: 'active', withdrawalRequestedAt: undefined })}>Add deposit</button>
      <button className="btn secondary" onClick={() => setUser({ ...user, depositStatus: 'withdrawal_pending', withdrawalRequestedAt: Date.now() })}>Request withdrawal</button>
    </div>
  )
}

export const StaffPage = () => (
  <div className="stack">
    <Link className="btn" to="/staff/queue">Get next case</Link>
    <Card><p>My stats</p><p>Warnings</p><p>KYC status</p><Link to="/staff/kyc">Open KYC</Link></Card>
  </div>
)

export const StaffQueuePage = () => {
  const { assignRandomCase, user } = useApp()
  const nav = useNavigate()
  const [message, setMessage] = useState('')

  return (
    <div className="stack">
      <button
        className="btn"
        onClick={() => {
          const d = assignRandomCase(String(user.id))
          if (d) {
            nav(`/staff/case/${d.id}`)
            return
          }
          setMessage('No available disputes in queue.')
        }}
      >
        Assign me next case
      </button>
      {message && <Card><p>{message}</p></Card>}
    </div>
  )
}

export const StaffCasePage = () => {
  const { disputeId = '' } = useParams()
  const { disputes, decideDispute, user } = useApp()
  const nav = useNavigate()
  const d = disputes.find((x) => x.id === disputeId)
  const [winner, setWinner] = useState<'buyer' | 'seller'>('buyer')
  const [text, setText] = useState('')

  if (!d) return <p>Case not found</p>

  return (
    <div className="stack">
      <Card>
        <h3>Anonymous case {d.id}</h3>
        <p>Order reference: #{d.orderId.slice(-6)}</p>
        <p>{d.message}</p>
        {d.evidence.map((e, i) => <p key={i}>{e.type}: {e.url}</p>)}
      </Card>
      <div className="chips">
        <button className="chip" onClick={() => setWinner('buyer')}>Buyer wins</button>
        <button className="chip" onClick={() => setWinner('seller')}>Seller wins</button>
      </div>
      <textarea className="input" placeholder="Decision text" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn" onClick={() => { decideDispute(d.id, winner, text || 'Decision submitted', String(user.id)); nav('/staff') }}>
        Submit decision
      </button>
    </div>
  )
}

export const StaffKycPage = () => <div className="stack"><Card><h3>Arbitrator KYC</h3><p>Status: Verified (mock)</p></Card></div>

export const RoleGate = ({ children }: { children: ReactElement }) => {
  const { user } = useApp()
  const allowed = useMemo(() => ['trainee_arb', 'arb', 'senior_arb', 'admin'].includes(user.role), [user.role])
  return allowed ? children : <p>Staff access only.</p>
}
