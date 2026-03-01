import { useMemo, useState, type ReactElement } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TonConnectButton } from '@tonconnect/ui-react'
import { Card } from '../components/Card'
import { categories, DEPOSIT_THRESHOLD, games } from '../lib/mockData'
import { canOpenDispute, calcFee, isCompletedStatus, payoutBadge } from '../lib/domain'
import { useApp } from '../lib/AppContext'
import type { Offer, Role } from '../types'

export const HomePage = () => {
  const { offers } = useApp()
  return (
    <div className="stack">
      <input className="input" placeholder="Search games, offers, sellers" />
      <Card><h3>Popular games</h3><div className="chips">{games.map((g) => <Link key={g.id} className="chip" to={`/game/${g.id}`}>{g.title}</Link>)}</div></Card>
      <Card><h3>Categories</h3><div className="chips">{categories.map((c) => <span key={c} className="chip">{c}</span>)}</div></Card>
      <Card><h3>Top sellers</h3>{offers.slice(0, 3).map((o) => <p key={o.id}>⭐ {o.sellerStats.rating} · {o.sellerStats.deals} deals · {o.sellerStats.depositTon} TON deposit</p>)}</Card>
      <Card><h3>New offers</h3>{offers.slice(0, 6).map((o) => <OfferRow key={o.id} offer={o} />)}</Card>
    </div>
  )
}

const OfferRow = ({ offer }: { offer: Offer }) => (
  <Link to={`/offer/${offer.id}`} className="row">
    <strong>{offer.title}</strong><span>{offer.priceTon} TON</span>
    <small>{payoutBadge(offer)} · ⭐ {offer.sellerStats.rating} · {offer.sellerStats.depositTon} TON deposit</small>
  </Link>
)

export const GamePage = () => {
  const { gameId = '' } = useParams()
  const game = games.find((g) => g.id === gameId)
  if (!game) return <p>Game not found</p>
  return <div className="stack"><h2>{game.title}</h2><div className="chips">{game.tags.map((t) => <span className="chip" key={t}>{t}</span>)}</div><Card><h3>Categories</h3>{categories.map((c) => <Link className="row" key={c} to={`/game/${game.id}/offers/${c}`}>{c}</Link>)}</Card></div>
}

export const OffersPage = () => {
  const { offers } = useApp()
  const { gameId, category } = useParams()
  const filtered = offers.filter((o) => o.gameId === gameId && o.category === category)
  return <div className="stack"><div className="chips">{['Deposit only', 'Instant delivery', 'Online', 'Price'].map((f) => <span key={f} className="chip">{f}</span>)}</div><Card>{filtered.length ? filtered.map((o) => <OfferRow key={o.id} offer={o} />) : <p>No offers yet</p>}</Card></div>
}

export const OfferDetailsPage = () => {
  const { offers } = useApp()
  const { offerId = '' } = useParams()
  const offer = offers.find((o) => o.id === offerId)
  if (!offer) return <p>Offer not found</p>
  return <div className="stack"><h2>{offer.title}</h2><Card><p>{offer.description}</p><p>{offer.rules.warrantyText}</p><p>Delivery type: {offer.deliveryType}</p><p>Payout: {offer.payoutPolicy}</p></Card><Card><p>Seller ⭐ {offer.sellerStats.rating} · Deals {offer.sellerStats.deals}</p><p>Deposit {offer.sellerStats.depositTon} TON</p></Card><Link className="btn" to={`/checkout/${offer.id}`}>Buy</Link></div>
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
  return <div className="stack"><Card><p>Amount {offer.priceTon} TON</p><p>Fee (5%) {fee} TON</p><h3>Total {total} TON</h3></Card><TonConnectButton /><button className="btn secondary" onClick={() => setConnected(true)}>Simulate wallet connected</button>{connected && <button className="btn" onClick={() => nav(`/order/${createOrder(offer).id}`)}>Pay via escrow</button>}</div>
}

export const OrdersPage = () => {
  const { orders, offers, user } = useApp()
  const [mode, setMode] = useState<'buyer' | 'seller'>('buyer')
  const [tab, setTab] = useState<'active' | 'completed'>('active')

  const modeOrders = orders.filter((o) => (mode === 'buyer' ? o.buyerId === user.id : o.sellerId === user.id))
  const view = modeOrders.filter((o) => tab === 'active' ? !isCompletedStatus(o.status) : isCompletedStatus(o.status))

  return <div className="stack"><div className="chips"><button className="chip" onClick={() => setMode('buyer')}>Buyer</button><button className="chip" onClick={() => setMode('seller')}>Seller</button><button className="chip" onClick={() => setTab('active')}>Active</button><button className="chip" onClick={() => setTab('completed')}>Completed</button></div><Card>{view.length ? view.map((o) => <Link key={o.id} className="row" to={`/order/${o.id}`}>{offers.find((f) => f.id === o.offerId)?.title ?? o.offerId}<small>{mode} · {o.status} · {o.amountTon} TON</small></Link>) : <p>No orders in this view</p>}</Card></div>
}

export const OrderDetailsPage = () => {
  const { orderId = '' } = useParams()
  const { user, orders, offers, updateOrder, openDispute } = useApp()
  const nav = useNavigate()
  const order = orders.find((o) => o.id === orderId)
  if (!order) return <p>Order not found</p>

  const offer = offers.find((o) => o.id === order.offerId)
  const left = Math.max(0, Math.floor((order.timers.confirmUntil - Date.now()) / 1000 / 60))
  const canDispute = canOpenDispute(order)
  const isBuyer = user.id === order.buyerId
  const isSeller = user.id === order.sellerId

  return <div className="stack"><h3>{offer?.title}</h3><Card><p>Status: {order.status}</p><p>Confirm in: {left}m</p><p>Timeline: created → paid → delivering → delivered → confirmed/auto/disputed</p></Card>{isSeller && <button className="btn" onClick={() => updateOrder(order.id, { status: 'delivered' })}>Mark delivered</button>}{isBuyer && <button className="btn" onClick={() => updateOrder(order.id, { status: 'confirmed', closedAt: Date.now() })}>Confirm received</button>}{canDispute && <button className="btn secondary" onClick={() => nav(`/dispute/${openDispute(order.id, 'Need arbitration', isBuyer ? 'buyer' : 'seller').id}`)}>Open dispute</button>}<button className="btn secondary" onClick={() => updateOrder(order.id, { status: 'auto_confirmed', closedAt: Date.now() })}>Trigger auto confirm</button></div>
}

export const SellPage = () => {
  const { offers, user } = useApp()
  const myOffers = offers.filter((o) => o.sellerId === user.id)
  return <div className="stack"><Link className="btn" to="/sell/new">Create offer</Link><Card>{myOffers.length ? myOffers.map((o) => <OfferRow key={o.id} offer={o} />) : <p>No offers yet</p>}</Card></div>
}

export const SellNewPage = () => {
  const { addOffer, user } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({
    gameId: games[0].id,
    category: categories[0],
    title: '',
    description: '',
    priceTon: 1,
    deliveryType: 'instant' as const,
    payoutPolicy: 'instant_if_deposit' as const
  })

  return <div className="stack"><h3>Create Offer Wizard</h3><select className="input" value={form.gameId} onChange={(e) => setForm({ ...form, gameId: e.target.value })}>{games.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof categories[number] })}>{categories.map((c) => <option key={c}>{c}</option>)}</select><input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><input className="input" type="number" min="1" value={form.priceTon} onChange={(e) => setForm({ ...form, priceTon: Number(e.target.value) })} /><select className="input" value={form.deliveryType} onChange={(e) => setForm({ ...form, deliveryType: e.target.value as 'instant' | 'manual' })}><option value="instant">instant</option><option value="manual">manual</option></select><select className="input" value={form.payoutPolicy} onChange={(e) => setForm({ ...form, payoutPolicy: e.target.value as 'instant_if_deposit' | 'hold_24h' })}><option value="instant_if_deposit">instant_if_deposit</option><option value="hold_24h">hold_24h</option></select><button className="btn" onClick={() => { addOffer({ id: `off-${Date.now()}`, gameId: form.gameId, category: form.category, title: form.title || 'Untitled offer', description: form.description || '-', priceTon: form.priceTon, deliveryType: form.deliveryType, payoutPolicy: form.payoutPolicy, sellerId: user.id, sellerStats: { rating: user.sellerRating, deals: user.dealsCount, depositTon: user.depositTon }, rules: { autoCloseHours: 24, warrantyText: 'Basic warranty applies.' }, createdAt: Date.now() }); nav('/sell') }}>Publish</button></div>
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
  const { disputes, appealDispute } = useApp()
  const d = disputes.find((x) => x.id === disputeId)
  if (!d) return <p>Not found</p>
  const canAppeal = ['trainee_decided', 'arb_decided'].includes(d.status) && d.appealCount < 1
  return <div className="stack"><Card><p>Reason: {d.reasonCode}</p><p>{d.message}</p><p>Status: {d.status}</p>{d.decision && <p>Decision: {d.decision.text}</p>}</Card><Card><h4>Timeline</h4><p>opened → assigned → decision → escalations</p>{d.decision && <p>Winner: {d.decision.winner}</p>}</Card>{canAppeal && <button className="btn secondary" onClick={() => appealDispute(d.id)}>Appeal</button>}</div>
}

export const ProfilePage = () => {
  const { user, setUser } = useApp()
  const roles: Role[] = ['user', 'seller', 'trainee_arb', 'arb', 'senior_arb', 'admin']
  return <div className="stack"><Card><p>@{user.username}</p><p>Role: {user.role}</p><p>Buyer {user.buyerRating} · Seller {user.sellerRating}</p></Card><Card><p>Deposit {user.depositTon} TON ({user.depositStatus})</p><Link to="/deposit">Manage deposit</Link></Card><Card><p>Role switch (MVP debug)</p><select className="input" value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value as Role })}>{roles.map((r) => <option key={r}>{r}</option>)}</select></Card></div>
}

export const DepositPage = () => {
  const { user, setUser } = useApp()
  const eligible = user.depositStatus === 'active' && user.depositTon >= DEPOSIT_THRESHOLD
  const cooldownLeft = user.withdrawalRequestedAt ? Math.max(0, 24 - Math.floor((Date.now() - user.withdrawalRequestedAt) / 36e5)) : 0

  return <div className="stack"><Card><h3>{user.depositTon} TON</h3><p>Instant payout eligibility: {eligible ? 'Yes' : 'No'}</p><p>Cooldown: {user.depositStatus === 'withdrawal_pending' ? `${cooldownLeft}h left` : 'none'}</p></Card><button className="btn" onClick={() => setUser({ ...user, depositTon: user.depositTon + 10, depositStatus: 'active', withdrawalRequestedAt: undefined })}>Add deposit</button><button className="btn secondary" onClick={() => setUser({ ...user, depositStatus: 'withdrawal_pending', withdrawalRequestedAt: Date.now() })}>Request withdrawal</button></div>
}

export const StaffPage = () => <div className="stack"><Link className="btn" to="/staff/queue">Get next case</Link><Card><p>My stats</p><p>Warnings</p><p>KYC status</p><Link to="/staff/kyc">Open KYC</Link></Card></div>

export const StaffQueuePage = () => {
  const { assignRandomCase, user } = useApp()
  const nav = useNavigate()
  const [message, setMessage] = useState('')
  return <div className="stack"><button className="btn" onClick={() => { const d = assignRandomCase(String(user.id)); if (d) { nav(`/staff/case/${d.id}`); return } setMessage('No available disputes in queue.') }}>Assign me next case</button>{message && <Card><p>{message}</p></Card>}</div>
}

export const StaffCasePage = () => {
  const { disputeId = '' } = useParams()
  const { disputes, decideDispute, user } = useApp()
  const nav = useNavigate()
  const d = disputes.find((x) => x.id === disputeId)
  const [winner, setWinner] = useState<'buyer' | 'seller'>('buyer')
  const [text, setText] = useState('')

  if (!d) return <p>Case not found</p>

  return <div className="stack"><Card><h3>Anonymous case {d.id}</h3><p>Order: {d.orderId}</p><p>{d.message}</p>{d.evidence.map((e, i) => <p key={i}>{e.type}: {e.url}</p>)}</Card><div className="chips"><button className="chip" onClick={() => setWinner('buyer')}>Buyer wins</button><button className="chip" onClick={() => setWinner('seller')}>Seller wins</button></div><textarea className="input" placeholder="Decision text" value={text} onChange={(e) => setText(e.target.value)} /><button className="btn" onClick={() => { decideDispute(d.id, winner, text || 'Decision submitted', String(user.id)); nav('/staff') }}>Submit decision</button></div>
}

export const StaffKycPage = () => <div className="stack"><Card><h3>Arbitrator KYC</h3><p>Status: Verified (mock)</p></Card></div>

export const RoleGate = ({ children }: { children: ReactElement }) => {
  const { user } = useApp()
  const allowed = useMemo(() => ['trainee_arb', 'arb', 'senior_arb', 'admin'].includes(user.role), [user.role])
  return allowed ? children : <p>Staff access only.</p>
}
