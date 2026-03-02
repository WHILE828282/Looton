import { useMemo, useState, type ReactElement } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TonConnectButton } from '@tonconnect/ui-react'
import { Card } from '../components/Card'
import { categories, DEPOSIT_THRESHOLD, games } from '../lib/mockData'
import { canOpenDispute, calcFee, isCompletedStatus, payoutBadge } from '../lib/domain'
import { useApp } from '../lib/AppContext'
import type { Offer, OfferCategory, OfferDeliveryType, OfferPayoutPolicy, OrderStatus, Role } from '../types'

type SellForm = {
  gameId: string
  category: OfferCategory
  title: string
  description: string
  priceTon: number
  deliveryType: OfferDeliveryType
  payoutPolicy: OfferPayoutPolicy
}

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

const OfferRow = ({ offer }: { offer: Offer }) => (
  <Link to={`/offer/${offer.id}`} className="row">
    <strong>{offer.title}</strong>
    <span>{offer.priceTon} TON</span>
    <small>{payoutBadge(offer)} · ⭐ {offer.sellerStats.rating} · {offer.sellerStats.depositTon} TON deposit</small>
  </Link>
)

export const HomePage = () => {
  const { offers } = useApp()

  return (
    <div className="stack">
      <input className="input" placeholder="Search games, offers, sellers" />

      <Card>
        <h3>Popular games</h3>
        <div className="chips">
          {games.map((g) => (
            <Link key={g.id} className="chip" to={`/game/${g.id}`}>
              {g.title}
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <h3>Categories</h3>
        <div className="chips">{categories.map((c) => <span key={c} className="chip">{c}</span>)}</div>
      </Card>

      <Card>
        <h3>Top sellers</h3>
        {offers.slice(0, 3).map((o) => (
          <p key={o.id}>⭐ {o.sellerStats.rating} · {o.sellerStats.deals} deals · {o.sellerStats.depositTon} TON deposit</p>
        ))}
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
      <h2>{game.title}</h2>
      <div className="chips">{game.tags.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
      <Card>
        <h3>Categories</h3>
        {categories.map((c) => <Link className="row" key={c} to={`/game/${game.id}/offers/${c}`}>{c}</Link>)}
      </Card>
    </div>
  )
}

export const OffersPage = () => {
  const { offers } = useApp()
  const { gameId, category } = useParams()
  const filtered = offers.filter((o) => o.gameId === gameId && o.category === category)

  return (
    <div className="stack">
      <div className="chips">{['Deposit only', 'Instant delivery', 'Online', 'Price'].map((f) => <span key={f} className="chip">{f}</span>)}</div>
      <Card>{filtered.length ? filtered.map((o) => <OfferRow key={o.id} offer={o} />) : <p>No offers yet</p>}</Card>
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
