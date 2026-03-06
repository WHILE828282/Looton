import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { TonConnectButton } from '@tonconnect/ui-react'
import { Card } from '../components/Card'
import { categories, DEPOSIT_THRESHOLD, games } from '../lib/mockData'
import { canOpenDispute, calcFee, isCompletedStatus, payoutBadge } from '../lib/domain'
import { useApp } from '../lib/AppContext'
import { productApi } from '../lib/productApi'
import { ArrowLeftIcon, CheckDoubleIcon, CheckIcon, ClockIcon, EllipsisVerticalIcon, GlobeIcon, MoonIcon, SearchIcon, SendIcon, SettingsIcon, StarIcon, TonIcon, WalletIcon } from '../icons1/UiIcons'
import type { ChatMessage, Dispute, Offer, OfferCategory, OfferDeliveryType, OfferPayoutPolicy, OrderStatus, Product, ProductChatMessage, Review, Role } from '../types'


type SellForm = {
  gameId: string
  category: OfferCategory
  title: string
  description: string
  priceTon: number
  deliveryType: OfferDeliveryType
  payoutPolicy: OfferPayoutPolicy
}



const DISPUTE_POLICY = ` Dispute & Appeal Policy (Looton)

 What happens after a dispute is opened?

If a dispute is opened for your order:
• The transaction is immediately frozen.
• Funds remain secured in escrow.
• An independent Looton arbitrator is assigned.
• Both parties must provide evidence (screenshots, transaction IDs, chat history, delivery proof).

 Important: If the seller did not fulfill the order, do not cancel the dispute before the final arbitrator decision.`

const COMPLETE_ORDER_WARNING = `Confirm Order Completion

You are about to mark this order as Completed.

If you confirm:
• Escrow protection ends immediately.
• Payment is released to the seller.
• You may lose the ability to dispute this order.

 Confirm ONLY if you have:
• received the item/service in full,
• verified access/ownership (accounts/keys/subscriptions),
• checked that everything matches the listing.

 Do NOT confirm if:
• delivery is pending,
• the item is incorrect/partial,
• you were asked to confirm “in advance”.

If something is wrong, open a Dispute and wait for arbitration.`

const CANCEL_DISPUTE_WARNING = `Cancel Dispute

Canceling a dispute is a serious action.

If you cancel:
• the case is closed,
• arbitration stops,
• escrow may be released according to the current order state,
• reopening may be impossible.

 If the order is not fully delivered, DO NOT cancel.
Wait for the assigned arbitrator and provide evidence.`

const APPEAL_CONFIRM_STEPS = [
  'Step 1/3: Confirm you read the dispute and arbitration policy.',
  'Step 2/3: Confirm you understand appeal consequences.',
  'Step 3/3: Final confirmation to submit this appeal.'
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

const FAQ_SECTIONS = [
  'Looton Platform Rules',
  'Confirmation popup before completing an order',
  'Warning popup before canceling a dispute',
  'Terms of Service (legal-style)',
  'Seller Agreement',
  'Arbitration Rules'
] as const

const LOOTON_PLATFORM_RULES = `Looton Platform Rules

1. General Provisions

1.1. Looton is a digital goods marketplace inside Telegram where users can buy and sell game items, in-game currency, accounts, digital keys, subscriptions, Telegram gifts, and other digital products.

1.2. All transactions on Looton use escrow protection: the buyer’s funds are held by the system until the order is confirmed as completed.

1.3. By using Looton, you agree to these rules automatically.

1.4. Looton administration reserves the right to:

update or change these rules,

restrict access to the platform,

review and investigate accounts and orders,

temporarily hold withdrawals if suspicious activity is detected.

2. Core Platform Principles

Looton is built on:

transaction safety,

seller competition fairness,

buyer protection,

transparent dispute handling,

user anonymity.

Any behavior that undermines these principles may lead to penalties.

3. Rules for All Users

3.1. No Off-Platform Deals / No Contact Sharing

It is prohibited to:

share or request contact details,

move a deal outside Looton,

request direct payment outside escrow,

offer discounts in exchange for off-platform payment.

“Contact details” include:

Telegram usernames,

Discord IDs,

WhatsApp/VK/Instagram/email/phone numbers,

any external messenger or social profile.

Sanctions may include:

warning,

temporary suspension,

permanent ban,

payout restrictions.

3.2. Fraud and Deception

It is prohibited to:

sell non-existent goods/services,

mislead users intentionally,

use stolen accounts or stolen goods,

exploit platform vulnerabilities,

trick someone into confirming an order.

Sanctions may include:

permanent ban,

funds freeze,

ban of all linked accounts.

3.3. Review Manipulation

It is prohibited to:

buy/sell reviews,

inflate ratings artificially,

pressure users to change reviews,

post false reviews,

alter old reviews without a valid reason.

Sanctions may include:

review removal,

temporary suspension,

permanent ban for repeated behavior.

3.4. Spam and Advertising

It is prohibited to:

mass message users,

post unsolicited advertisements,

promote other marketplaces,

send unnecessary links.

Sanctions may include:

warning,

temporary or permanent suspension.

3.5. Communication Rules

It is prohibited to:

insult or harass users,

threaten others,

flood chats,

provoke conflict,

push political discussions,

send unwanted sexual content.

Sanctions may include:

warning,

temporary suspension,

permanent ban for repeated violations.

3.6. Sharing Private User Information

It is prohibited to disclose or distribute:

usernames/IDs,

order amounts,

private chat screenshots,

private order details,

especially when done to harm another user.

Sanctions may include:

permanent ban,

funds restrictions.

4. Seller Rules

4.1. Seller Responsibilities

Sellers must:

deliver the order within the agreed timeframe,

deliver the full quantity/value as described,

answer buyer questions related to the order,

cooperate during disputes and provide evidence when requested.

4.2. Prohibited Seller Behavior

Sellers must not:

ask buyers to confirm completion before delivery,

ignore buyer questions without reason,

publish fake listings or misleading pricing,

create duplicate listings to spam search,

list items in the wrong category to avoid competition or rules.

Sanctions may include:

listing removal,

temporary suspension,

permanent ban for repeated violations.

4.3. Fee Avoidance / Escrow Bypass

It is prohibited to:

request direct payment,

offer discounts for off-platform payments,

complete deals outside Looton escrow.

Sanctions may include:

permanent ban,

payout refusal in severe cases.

5. Prohibited Items & Categories

Looton prohibits selling:

stolen/hacked accounts,

unlawfully obtained goods,

personal data,

malware or harmful software,

fraud tutorials or scam tools,

spam services,

illegal content or anything violating applicable law.

Sanctions may include:

permanent ban,

funds restrictions,

additional verification requests.

6. Escrow Protection Rules

6.1. After payment, the buyer’s funds are held in escrow.

6.2. The seller receives funds only after the buyer confirms successful completion.

6.3. Buyers must confirm completion only after verifying delivery.

7. Disputes

If something goes wrong with an order:

a dispute may be opened,

the order becomes frozen,

escrow funds remain locked,

both parties must provide evidence,

an arbitrator reviews the case and issues a decision.

8. Looton Arbitration System

Looton uses a three-level arbitration model:

Level 1 — Trainee Arbitrator

Handles simple disputes and first reviews.

Level 2 — Arbitrator

Handles complex disputes and appeals.

Level 3 — Senior Arbitrator

Provides final decisions on escalated cases.

The decision of the Senior Arbitrator is final within platform rules.

9. Appeals

If a user disagrees with a decision:

they may submit an appeal,

the case may be escalated to a higher level,

the final decision will be made by a Senior Arbitrator.

Appeal abuse (spam appeals) may lead to restrictions.

10. Seller Liability & Refund Outcomes

If a seller:

fails to deliver,

delivers partially,

delivers an incorrect product/service,

violates listing terms,

the arbitration team may order:

full refund,

partial refund,

compensation for proven damage (when applicable).

11. Withdrawals & Seller Deposits

11.1. Standard withdrawal can take up to 24 hours.

11.2. Instant withdrawal may be available for sellers who maintain a permanent deposit (stake) on the platform.

11.3. If a seller withdraws their deposit, instant withdrawals may be temporarily disabled and the standard withdrawal window applies.

Looton may hold withdrawals if suspicious activity is detected.

12. Account Reviews & Checks

Looton may:

review suspicious activity,

restrict features temporarily,

request additional checks for arbitrators (KYC for arbitration roles),

take action to protect users and the platform.

13. Platform Role & Limitation

Looton is not the seller of goods. Looton provides:

escrow infrastructure,

dispute resolution mechanisms,

marketplace tools.

Users are responsible for listing accuracy and legal compliance.

14. Administration Rights

Looton administration may:

remove listings,

restrict accounts,

reverse actions when required for safety,

apply sanctions,

update rules at any time.`


const formatLeftMinutes = (confirmUntil: number) => {
  const left = Math.max(0, Math.floor((confirmUntil - Date.now()) / 1000 / 60))
  return `${left}m`
}



const getStaffAssigneeKey = (id: number, username: string) => `${id}:${username}`

const isAssignedToStaff = (assignedTo: string | undefined, userId: number, username: string) => {
  if (!assignedTo) return false
  return assignedTo === String(userId) || assignedTo === getStaffAssigneeKey(userId, username)
}

const gameIconSrc = (gameId?: string) => games.find((g) => g.id === gameId)?.iconUrl ?? '/icon.svg'

const PROFILE_SETTINGS_PRIMARY = [
  { icon: 'language', label: 'Language', value: 'English' },
  { icon: 'wallet', label: 'Wallet currency', value: 'USD' },
  { icon: 'time', label: 'Timezone', value: 'UTC+3' },
  { icon: 'theme', label: 'Theme', value: 'Auto' },
  { icon: 'settings', label: 'Exchange settings', value: 'Open' }
] as const

const PROFILE_LEGAL_LINKS = [
  'AML Policy',
  'Privacy Policy',
  'Terms of Use',
  'Website Usage Rules'
] as const

const settingsIconMap = {
  language: GlobeIcon,
  wallet: WalletIcon,
  time: ClockIcon,
  theme: MoonIcon,
  settings: SettingsIcon
} as const

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
    <small>{payoutBadge(offer)} · <StarIcon className="inline-star-icon" /> {offer.sellerStats.rating} · {offer.sellerStats.depositTon} TON deposit</small>
  </Link>
)

export const HomePage = () => {
  const { offers, user } = useApp()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')

  const trendingSections = [
    { id: 'accounts', title: 'Popular Accounts', to: '/game/mlbb/offers/accounts', iconUrl: gameIconSrc('mlbb') },
    { id: 'currency', title: 'Popular Currencies', to: '/game/mlbb/offers/currency', iconUrl: gameIconSrc('mlbb') },
    { id: 'items', title: 'Popular Items', to: '/game/cs2/offers/items', iconUrl: gameIconSrc('cs2') },
    { id: 'services', title: 'Popular Boosting', to: '/game/gta5/offers/services', iconUrl: gameIconSrc('gta5') }
  ]
  const trustStats = [
    { label: 'Deals 24h', value: '1,200+' },
    { label: 'Verified sellers', value: '340+' },
    { label: 'Avg delivery', value: '8m' }
  ]

  const searchSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const gameItems = games
      .filter((game) => game.title.toLowerCase().includes(q))
      .map((game) => ({ id: `game-${game.id}`, label: game.title, hint: 'Game', to: `/game/${game.id}` }))

    const offerItems = offers
      .filter((offer) => offer.title.toLowerCase().includes(q))
      .map((offer) => ({ id: `offer-${offer.id}`, label: offer.title, hint: 'Offer', to: `/offer/${offer.id}` }))

    const categoryItems = categories
      .filter((category) => category.toLowerCase().includes(q))
      .map((category) => ({
        id: `category-${category}`,
        label: `${category} in ${games[0].title}`,
        hint: 'Category filter',
        to: `/game/${games[0].id}/offers/${category}`
      }))

    return [...gameItems, ...offerItems, ...categoryItems].slice(0, 8)
  }, [query, offers])

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
  const popularItems = offers
    .filter((offer) => offer.sellerId !== user.id)
    .map((o) => ({
      id: `${o.id}-item`,
      title: o.title,
      to: `/offer/${o.id}`,
      iconUrl: gameIconSrc(o.gameId)
    }))

  return (
    <div className="stack market-home">
      <div className="search-wrap market-search-wrap">
        <span className="market-search-icon" aria-hidden><SearchIcon /></span>
        <input className="input market-search-input" placeholder="Search games, offers, sellers" value={query} onChange={(event) => setQuery(event.target.value)} />
        {!!searchSuggestions.length && (
          <div className="search-suggestions card">
            {searchSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="search-suggestion"
                onClick={() => {
                  setQuery('')
                  nav(suggestion.to)
                }}
              >
                <strong>{suggestion.label}</strong>
                <small>{suggestion.hint}</small>
              </button>
            ))}
          </div>
        )}
      </div>

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
        <h3>Trending </h3>
        <div className="trending-scroll">
          {trendingSections.map((section, index) => (
            <Link key={section.id} className={`trending-item ${index === 0 ? 'active' : ''}`} to={section.to}>
              <GameIcon src={section.iconUrl} alt={section.title} />
              <span>{section.title}</span>
            </Link>
          ))}
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
        <h3>Safe deal checklist</h3>
        <ul>
          <li>Check seller rating and deposit before purchase.</li>
          <li>Keep all proofs in chat, including screenshots and delivery data.</li>
          <li>Use dispute report in chat if delivery is invalid or missing.</li>
          <li>Never transfer funds outside the platform escrow flow.</li>
        </ul>
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
              <StarIcon className="inline-star-icon" /> {o.sellerStats.rating} · {o.deliveryType} · {payoutBadge(o)} · Deposit {o.sellerStats.depositTon} TON
            </small>
            <span>{o.priceTon} TON</span>
          </Link>
        )) : <p>No offers yet</p>}
      </Card>
    </div>
  )
}

const StarRating = ({ rating = null }: { rating?: ProductChatMessage['rating'] | null }) => {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating ?? 0)))
  return (
    <div className="chat-stars" aria-label={`Rating ${safeRating} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon key={index} className={index < safeRating ? 'active' : ''} />
      ))}
    </div>
  )
}

const formatChatDayLabel = (dateIso: string) => {
  const date = new Date(dateIso)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const ChatBubble = ({ message, compact }: { message: ProductChatMessage; compact: boolean }) => (
  <article className={`chat-message-row ${message.author === 'seller' ? 'seller' : 'buyer'} ${compact ? 'compact' : ''}`}>
    <div className={`chat-message-bubble ${message.author === 'seller' ? 'seller' : 'buyer'}`}>
      {message.orderMeta && (
        <p className="chat-order-meta review-order-meta">
          <span>{message.orderMeta.productLabel}</span>
          <span className="ton-amount"><span>{Math.max(1, Math.round(message.orderMeta.priceRub / 50))}</span> <TonIcon className="ton-inline-icon" /> TON</span>
        </p>
      )}
      {message.rating && <StarRating rating={message.rating} />}
      <p className="chat-message-text">{message.text}</p>
    </div>
  </article>
)

const SellerDescription = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="product-block">
      <h3>Seller description</h3>
      <p className={expanded ? 'seller-description expanded' : 'seller-description'}>{text}</p>
      <button className="text-btn" onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'Hide' : 'Show more'}
      </button>
    </section>
  )
}

export const OfferDetailsPage = () => {
  const { offers } = useApp()
  const navigate = useNavigate()
  const { offerId = '' } = useParams()
  const currentOffer = offers.find((item) => item.id === offerId)
  const [product, setProduct] = useState<Product | null>(null)
  const [messages, setMessages] = useState<ProductChatMessage[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isProductLoading, setIsProductLoading] = useState(true)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const sellerName = currentOffer ? `verified_seller_${currentOffer.sellerId}` : 'verified_seller'
  const topSentinelRef = useRef<HTMLDivElement | null>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true
    setIsProductLoading(true)
    productApi.getProduct({ id: offerId, fallbackTitle: currentOffer?.title, category: currentOffer?.category }).then((data) => {
      if (!mounted) return
      setProduct(data)
      setIsProductLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [offerId, currentOffer?.title, currentOffer?.category])

  const loadOlderMessages = async () => {
    if (isChatLoading || nextCursor === null) return
    setIsChatLoading(true)
    const previousHeight = messagesRef.current?.scrollHeight ?? 0

    const page = await productApi.getChatMessages({
      id: offerId,
      cursor: nextCursor,
      limit: 12
    })

    setMessages((prev) => [...page.items, ...prev])
    setNextCursor(page.nextCursor)
    setIsChatLoading(false)

    requestAnimationFrame(() => {
      if (!messagesRef.current) return
      const newHeight = messagesRef.current.scrollHeight
      messagesRef.current.scrollTop += newHeight - previousHeight
    })
  }

  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      setIsChatLoading(true)
      const page = await productApi.getChatMessages({
        id: offerId,
        cursor: null,
        limit: 12
      })
      if (!active) return
      setMessages(page.items)
      setNextCursor(page.nextCursor)
      setIsChatLoading(false)
      requestAnimationFrame(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight
        }
      })
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [offerId, currentOffer?.title])

  useEffect(() => {
    let active = true
    const loadReviews = async () => {
      const data = await productApi.getReviews({ offerId })
      if (!active) return
      setReviews(data)
    }
    void loadReviews()
    return () => {
      active = false
    }
  }, [offerId])

  useEffect(() => {
    if (!topSentinelRef.current || !messagesRef.current) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadOlderMessages()
    }, { root: messagesRef.current, rootMargin: '40px' })

    observer.observe(topSentinelRef.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesRef, topSentinelRef, nextCursor, isChatLoading, offerId])


  const conversationMessages = messages

  const showConversationDaySeparator = (index: number) => {
    if (index === 0) return true
    return formatChatDayLabel(conversationMessages[index - 1].createdAt) !== formatChatDayLabel(conversationMessages[index].createdAt)
  }

  const shouldShowSellerTrustCard = conversationMessages.length === 0
  const sellerPreviewStars = Math.max(1, Math.min(5, Math.round(currentOffer?.sellerStats.rating ?? 5)))
  const sellerReviewCount = reviews.length
  const sellerCompletionRate = Math.max(90, Math.min(100, Math.round(((currentOffer?.sellerStats.rating ?? 5) / 5) * 1000) / 10))

  const onSend = () => {
    const text = chatInput.trim()
    if (!text) return
    const message: ProductChatMessage = {
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: 'buyer',
      text
    }
    setMessages((prev) => [...prev, message])
    setChatInput('')
    requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight
      }
    })
  }

  if (isProductLoading || !product) {
    return <div className="stack"><p>Loading product...</p></div>
  }

  return (
    <div className="product-page">
      <header className="product-header">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeftIcon /></button>
        <h2>{currentOffer?.title ?? product.title}</h2>
        <div className="product-header-actions">
          <button className="icon-btn" aria-label="Search"><SearchIcon /></button>
          <button className="icon-btn" aria-label="Theme"><MoonIcon /></button>
          <button className="icon-btn" aria-label="Menu"><EllipsisVerticalIcon /></button>
        </div>
      </header>

      <section className="product-block product-meta-grid">
        <div><span>Delivery method</span><strong>{product.deliveryMethod}</strong></div>
        <div><span>Stock</span><strong>{product.stockText}</strong></div>
        <div><span>Delivery time</span><strong>{product.deliveryTimeText}</strong></div>
        {product.category && <div><span>Category</span><strong>{product.category}</strong></div>}
      </section>

      <SellerDescription text={product.sellerDescription} />

      <section className="seller-chat-screen">
        <div className="seller-chat-top">
          <div className="seller-chat-identity">
            <span className="seller-avatar">S</span>
            <div>
              <p className="seller-chat-name">{sellerName}</p>
              <p className="seller-chat-status">Online</p>
            </div>
          </div>
          <button className="seller-chat-icons" aria-label="Chat menu"><EllipsisVerticalIcon /></button>
        </div>

        <div className="chat-messages" ref={messagesRef}>
          <div ref={topSentinelRef} className="chat-top-sentinel" />
          {nextCursor !== null && (
            <button className="load-older-btn" onClick={() => void loadOlderMessages()} disabled={isChatLoading}>
              {isChatLoading ? 'Loading…' : 'Load older messages'}
            </button>
          )}

          {shouldShowSellerTrustCard && (
            <div className="chat-empty-tip seller-trust-card" role="note" aria-live="polite">
              <div className="seller-trust-stars" aria-label={`Seller rating ${sellerPreviewStars} out of 5`}>
                {Array.from({ length: 5 }).map((_, index) => <StarIcon key={`trust-star-${index}`} className={index < sellerPreviewStars ? 'active' : ''} />)}
              </div>
              <p className="seller-trust-reviews">
                {sellerReviewCount ? `${sellerReviewCount} reviews from buyers` : 'Trusted seller profile'}
              </p>
              <p className="seller-trust-metric">{sellerCompletionRate.toFixed(1)}% completed orders</p>
              <p className="seller-trust-tip">Message seller before payment</p>
            </div>
          )}

          {conversationMessages.map((message, index) => {
            const compact = index > 0 && conversationMessages[index - 1].author === message.author
            return (
              <div key={message.id}>
                {showConversationDaySeparator(index) && (
                  <div className="chat-day-separator">
                    <span>{formatChatDayLabel(message.createdAt)}</span>
                  </div>
                )}
                <ChatBubble message={message} compact={compact} />
              </div>
            )
          })}
        </div>


        <div className="chat-input-bar">
          <input
            className="input chat-offer-input"
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Write a message..."
          />
          <button className="btn chat-send-btn" type="button" onClick={onSend} disabled={!chatInput.trim()}>
            <SendIcon />
          </button>
        </div>
      </section>

      <section className="product-block product-reviews">
        <h3>Reviews</h3>
        {reviews.length ? reviews.map((review) => {
          const amountTon = Math.max(1, Math.round(review.priceRub / 50))
          return (
            <article className="review-item" key={review.id}>
              <StarRating rating={review.rating} />
              <p className="chat-order-meta review-order-meta">
                <span>{review.productLabel}</span>
                <span className="ton-amount"><span>{amountTon}</span> <TonIcon className="ton-inline-icon" /> TON</span>
              </p>
              <p className="chat-message-text">{review.text}</p>
            </article>
          )
        }) : <p className="muted">No reviews yet.</p>}
      </section>
    </div>
  )
}

export const CheckoutPage = () => {
  const { offers, createOrder } = useApp()
  const { offerId = '' } = useParams()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
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

  const ownedOrders = orders.filter((o) => o.buyerId === user.id || o.sellerId === user.id)
  const hasBuyerOrders = ownedOrders.some((o) => o.buyerId === user.id)
  const hasSellerOrders = ownedOrders.some((o) => o.sellerId === user.id)

  useEffect(() => {
    if (mode === 'buyer' && !hasBuyerOrders && hasSellerOrders) setMode('seller')
    if (mode === 'seller' && !hasSellerOrders && hasBuyerOrders) setMode('buyer')
  }, [mode, hasBuyerOrders, hasSellerOrders])

  const modeOrders = ownedOrders.filter((o) => (mode === 'buyer' ? o.buyerId === user.id : o.sellerId === user.id))
  const view = modeOrders.filter((o) => (tab === 'active' ? !isCompletedStatus(o.status) : isCompletedStatus(o.status)))

  return (
    <div className="stack">
      <div className="chips segmented">
        {hasBuyerOrders && <button className={`chip ${mode === 'buyer' ? 'active' : ''}`} onClick={() => setMode('buyer')}>Buyer</button>}
        {hasSellerOrders && <button className={`chip ${mode === 'seller' ? 'active' : ''}`} onClick={() => setMode('seller')}>Seller</button>}
        <button className={`chip ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active</button>
        <button className={`chip ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>Completed</button>
      </div>
      <Card>
        {view.length ? view.map((o) => (
          <Link key={o.id} className="row" to={`/order/${o.id}`}>
            {offers.find((f) => f.id === o.offerId)?.title ?? o.offerId}
            <small>{mode} · <StatusBadge status={o.status} /> · {o.amountTon} TON</small>
          </Link>
        )) : <p>No personal orders in this view</p>}
      </Card>
    </div>
  )
}

export const OrderDetailsPage = () => {
  const { orderId = '' } = useParams()
  const { user, orders, offers, updateOrder } = useApp()
  const order = orders.find((o) => o.id === orderId)

  if (!order) return <p>Order not found</p>

  const isParticipant = user.id === order.buyerId || user.id === order.sellerId
  if (!isParticipant) return <p>Order not available for this account.</p>

  const offer = offers.find((o) => o.id === order.offerId)
  const canDispute = canOpenDispute(order)
  const isBuyer = user.id === order.buyerId
  const isSeller = user.id === order.sellerId
  const canMarkDelivered = isSeller && (!isBuyer || user.role === 'seller')
  const canConfirmReceived = isBuyer && (!isSeller || user.role !== 'seller')

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
      {canDispute && <p>Use chat report to open a dispute for this order.</p>}
      <button className="btn secondary" onClick={() => updateOrder(order.id, { status: 'auto_confirmed', closedAt: Date.now() })}>
        Trigger auto confirm
      </button>
    </div>
  )
}

export const ChatPage = () => {
  const { orderId = '' } = useParams()
  const { user, orders, offers, disputes, chatMessages, sendOrderMessage, openDispute, joinDisputeChat } = useApp()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const [draft, setDraft] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState<'not_received' | 'invalid' | 'restored_account' | 'other'>('not_received')
  const [reportDetails, setReportDetails] = useState('')
  const [attachedImage, setAttachedImage] = useState<string | undefined>()
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [hasExistingReview, setHasExistingReview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const order = orders.find((o) => o.id === orderId)

  if (!order) return <p>Order not found</p>

  const offer = offers.find((item) => item.id === order.offerId)
  const requestedDisputeId = searchParams.get('dispute') ?? ''
  const activeDispute = disputes.find((item) => {
    if (item.orderId !== order.id) return false
    if (!requestedDisputeId) return ['opened', 'assigned_trainee', 'escalated_to_arb', 'escalated_to_senior'].includes(item.status)
    return item.id === requestedDisputeId
  })
  const isArbitrator = ['trainee_arb', 'arb', 'senior_arb', 'admin'].includes(user.role)
  const canModerateChat = isArbitrator && Boolean(activeDispute && isAssignedToStaff(activeDispute.assignedTo, user.id, user.username))
  const isParticipant = user.id === order.buyerId || user.id === order.sellerId
  const canAccessChat = canModerateChat || (!isArbitrator && isParticipant)
  const sender: ChatMessage['sender'] = isArbitrator ? 'arb' : user.id === order.sellerId ? 'seller' : 'buyer'
  const offerTitle = offer?.title ?? 'Custom order'
  const offerDescription = offer?.description?.trim() || 'Contact seller before payment for fast processing.'
  const orderStatusLabel = order.status.replace('_', ' ')
  const peerId = user.id === order.sellerId ? order.buyerId : order.sellerId
  const peerLabel = sender === 'buyer' ? `seller_${order.sellerId}` : `buyer_${order.buyerId}`
  const blockStorageKey = `looton_block_peer_${user.id}_${peerId}`
  const [peerBlocked, setPeerBlocked] = useState(() => localStorage.getItem(blockStorageKey) === '1')
  const canLeaveReview = sender === 'buyer' && ['confirmed', 'auto_confirmed'].includes(order.status)
  const showReviewComposer = canLeaveReview && !hasExistingReview && !reviewSubmitted

  if (!canAccessChat) {
    return (
      <div className="stack">
        <Card>
          <h3>Chat access restricted</h3>
          <p>This chat is available only to the assigned arbitrator (for staff) or to buyer/seller (for regular users).</p>
          <Link className="btn" to={isArbitrator ? '/staff/queue' : '/orders'}>Go back</Link>
        </Card>
      </div>
    )
  }

  const messages = chatMessages
    .filter((m) => m.orderId === order.id)
    .sort((a, b) => a.createdAt - b.createdAt)

  const groupedMessages = useMemo(
    () => messages.map((message, index) => {
      const prev = messages[index - 1]
      const next = messages[index + 1]
      const isGroupable = message.sender !== 'system'
      const withPrev = Boolean(
        isGroupable &&
        prev &&
        prev.sender === message.sender &&
        prev.sender !== 'system' &&
        message.createdAt - prev.createdAt <= 5 * 60_000
      )
      const withNext = Boolean(
        isGroupable &&
        next &&
        next.sender === message.sender &&
        next.sender !== 'system' &&
        next.createdAt - message.createdAt <= 5 * 60_000
      )

      return {
        message,
        isGroupStart: !withPrev,
        isGroupEnd: !withNext
      }
    }),
    [messages]
  )

  useEffect(() => {
    if (!canModerateChat || !activeDispute) return
    const alias = activeDispute.arbitratorAlias || `arb_${user.id}`
    joinDisputeChat(activeDispute.id, alias)
  }, [canModerateChat, activeDispute, joinDisputeChat, user.id])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current || !event.target) return
      if (!menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    setPeerBlocked(localStorage.getItem(blockStorageKey) === '1')
  }, [blockStorageKey])

  useEffect(() => {
    let active = true
    if (!canLeaveReview || !offer) {
      setHasExistingReview(false)
      return () => {
        active = false
      }
    }

    const checkReview = async () => {
      const exists = await productApi.hasReviewForOrder({ offerId: offer.id, orderId: order.id })
      if (!active) return
      setHasExistingReview(exists)
    }

    void checkReview()
    return () => {
      active = false
    }
  }, [canLeaveReview, offer, order.id])

  const submitOrderReview = async () => {
    if (!offer || !canLeaveReview) return
    if (reviewRating === null) return
    const text = reviewText.trim()
    if (!text) return
    setReviewSubmitting(true)
    try {
      await productApi.submitReview({
        offerId: offer.id,
        orderId: order.id,
        productLabel: offerTitle,
        amountTon: order.amountTon,
        rating: reviewRating,
        text
      })
      setReviewSubmitted(true)
      setHasExistingReview(true)
      setReviewText('')
      setReviewRating(null)
    } finally {
      setReviewSubmitting(false)
    }
  }

  const togglePeerBlock = () => {
    const next = !peerBlocked
    localStorage.setItem(blockStorageKey, next ? '1' : '0')
    setPeerBlocked(next)
    setMenuOpen(false)
  }

  const reportReasonOptions: { value: Dispute['reasonCode']; label: string }[] = [
    { value: 'not_received', label: 'Seller did not deliver the order' },
    { value: 'invalid', label: 'Delivered item/service is invalid' },
    { value: 'restored_account', label: 'Account was restored by original owner' },
    { value: 'other', label: 'Other issue' }
  ]

  const getOwnMessageState = (message: ChatMessage, index: number): 'sent' | 'delivered' | 'read' => {
    const nextForeignReply = messages.slice(index + 1).find((item) => item.sender !== message.sender && item.sender !== 'system')
    if (nextForeignReply) return 'read'
    if (Date.now() - message.createdAt > 15_000) return 'delivered'
    return 'sent'
  }

  const readStateLabel: Record<'sent' | 'delivered' | 'read', string> = {
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read'
  }

  return (
    <div className="order-chat-mobile">
      <header className="product-header">
        <button className="icon-btn" onClick={() => nav(-1)} aria-label="Go back"><ArrowLeftIcon /></button>
        <h2>{offerTitle}</h2>
        <div className="product-header-actions" />
      </header>

      <section className="product-block product-meta-grid">
        <div><span>Delivery method</span><strong>{offer?.deliveryType ?? 'Manual'}</strong></div>
        <div><span>Stock</span><strong>{offer?.stock ? `${offer.stock} units` : 'Available'}</strong></div>
        <div><span>Delivery time</span><strong>{offer?.deliveryType === 'instant' ? '1 minute – 1 hour' : '5 minutes – 1 day'}</strong></div>
        <div><span>Category</span><strong>{offer?.category ?? 'General'}</strong></div>
      </section>

      <div className="order-chat-layout">
        <section className="product-block listing-panel">
          <h3>Listing details</h3>
          <p className={expandedDescription ? 'seller-description expanded' : 'seller-description'}>{offerDescription}</p>
          <button className="text-btn" onClick={() => setExpandedDescription((v) => !v)}>{expandedDescription ? 'Hide' : 'Show more'}</button>
          <div className="listing-tags">
            <span className="chip">{offer?.category ?? 'General'}</span>
            <span className="chip">{offer?.deliveryType ?? 'manual'} delivery</span>
            <span className="chip">Escrow protected</span>
          </div>
        </section>

        <section className="seller-chat-screen">
        <div className="seller-chat-top">
          <div className="seller-chat-identity">
            <span className="seller-avatar">{`S`}<span className="seller-avatar-presence" aria-hidden /></span>
            <div>
              <p className="seller-chat-name">seller_{order.sellerId}</p>
              <p className="seller-chat-status">Online</p>
            </div>
          </div>
          <div className="chat-menu-wrap" ref={menuRef}>
            <button className="seller-chat-icons" aria-label="Chat menu" onClick={() => setMenuOpen((v) => !v)}><EllipsisVerticalIcon /></button>
            {menuOpen && (
              <div className="chat-menu card">
                <button className="chat-menu-item" onClick={() => {
                  setReportOpen(true)
                  setMenuOpen(false)
                }}>
                  Open dispute
                </button>
                <button className="chat-menu-item danger" onClick={togglePeerBlock}>
                  {peerBlocked ? 'Unblock user' : 'Block user'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="chat-messages">
          {groupedMessages.length ? groupedMessages.map(({ message, isGroupStart, isGroupEnd }, index) => {
            const isMine = (sender === 'buyer' && message.sender === 'buyer') || (sender === 'seller' && message.sender === 'seller') || (sender === 'arb' && message.sender === 'arb')
            const ownState = isMine && message.sender !== 'system' ? getOwnMessageState(message, index) : undefined
            const label = message.sender === 'system' ? 'System' : message.sender === 'buyer' ? `buyer_${order.buyerId}` : message.sender === 'seller' ? `seller_${order.sellerId}` : `Arbitrator ${message.arbAlias ?? ''}`.trim()
            return (
              <div key={message.id} className={`msg-row ${isMine ? 'mine' : ''} ${isGroupStart ? 'group-start' : 'group-middle'} ${isGroupEnd ? 'group-end' : ''}`}>
                {!isMine && message.sender !== 'system' && (isGroupStart
                  ? <span className="msg-avatar">{label[0]?.toUpperCase()}</span>
                  : <span className="msg-avatar-spacer" aria-hidden />)}
                <div className={`chat-bubble ${message.sender} ${isGroupStart ? 'group-start' : ''} ${isGroupEnd ? 'group-end' : ''}`}>
                  {!isMine && message.sender !== 'system' && isGroupStart && <small className="msg-author">{label}</small>}
                  {message.sender === 'system' && <small className="msg-author">{label}</small>}
                  <p>{message.text}</p>
                  {message.imageUrl && <img src={message.imageUrl} alt="Chat attachment" className="chat-attachment" />}
                  <small className="msg-time">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {ownState && (
                      <span className={`msg-read msg-read-${ownState}`}>
                        {ownState === 'sent' ? <CheckIcon className="msg-read-icon" /> : <CheckDoubleIcon className="msg-read-icon" />}
                        {' '}
                        {readStateLabel[ownState]}
                      </span>
                    )}
                  </small>
                </div>
              </div>
            )
          }) : <div className="chat-empty-tip">No messages yet</div>}
        </div>

        {peerBlocked && !canModerateChat && (
          <div className="chat-warning">You blocked {peerLabel}. Unblock this user in menu to continue messaging.</div>
        )}

        {reportOpen && (
          <div className="chat-report card">
            <h4>Open dispute from chat report</h4>
            <p>Select a reason for your appeal/dispute:</p>
            <select className="input" value={reportReason} onChange={(event) => setReportReason(event.target.value as Dispute['reasonCode'])}>
              {reportReasonOptions.map((reason) => (
                <option key={reason.value} value={reason.value}>{reason.label}</option>
              ))}
            </select>
            <textarea className="input" placeholder="Describe the problem in detail" value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} />
            <div className="chips">
              <button className="chip active" onClick={() => {
                if (!window.confirm(DISPUTE_POLICY)) return
                const details = reportDetails.trim() || `Reason: ${reportReason}`
                const dispute = openDispute(order.id, details, sender === 'seller' ? 'seller' : 'buyer', reportReason)
                setReportOpen(false)
                setReportDetails('')
                nav(`/dispute/${dispute.id}`)
              }}>Submit report</button>
              <button className="chip" onClick={() => setReportOpen(false)}>Cancel</button>
            </div>
          </div>
        )}

        {showReviewComposer && (
          <section className="chat-review-composer" aria-label="Leave seller review">
            <h4>Order completed. Leave a review for {peerLabel}</h4>
            <p>Your rating helps other buyers choose reliable sellers.</p>
            <div className="chat-review-stars" role="radiogroup" aria-label="Choose a rating">
              {([1, 2, 3, 4, 5] as const).map((value) => (
                <button
                  key={`review-star-${value}`}
                  className={`icon-btn review-star-btn ${(reviewRating ?? 0) >= value ? 'active' : ''}`}
                  type="button"
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  aria-pressed={(reviewRating ?? 0) >= value}
                  onClick={() => setReviewRating(value)}
                >
                  <StarIcon />
                </button>
              ))}
            </div>
            <textarea
              className="input"
              placeholder="What did you like about this order?"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows={3}
            />
            <button className="btn" type="button" disabled={reviewSubmitting || reviewRating === null || !reviewText.trim()} onClick={() => void submitOrderReview()}>
              {reviewSubmitting ? 'Submitting review…' : 'Submit review'}
            </button>
          </section>
        )}

        {canLeaveReview && hasExistingReview && (
          <div className="chat-review-success">Your review for this completed order is already published.</div>
        )}

        <div className="chat-input-bar">
          <label className="icon-btn attach-btn" title="Attach file">
            <svg className="icon icon-paperclip" aria-hidden><use href="#i-attach" /></svg>
            <input
              ref={fileInputRef}
              className="file-input"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setAttachedImage(typeof reader.result === 'string' ? reader.result : undefined)
                reader.readAsDataURL(file)
              }}
            />
          </label>
          <div className="chat-input-wrap">
            <textarea
              className="input chat-input"
              placeholder={peerBlocked ? `Unblock ${peerLabel} to continue chatting...` : canModerateChat ? 'Ask clarifying questions as an arbitrator...' : 'Write a message...'}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={1}
              disabled={peerBlocked && !canModerateChat}
            />
            {attachedImage && <small className="attach-hint">Image attached</small>}
          </div>
          <button
            className="icon-btn send-btn"
            aria-label="Send message"
            disabled={(peerBlocked && !canModerateChat) || !draft.trim()}
            onClick={() => {
              if (peerBlocked && !canModerateChat) return
              sendOrderMessage(
                order.id,
                sender,
                draft,
                sender === 'arb' ? (activeDispute?.arbitratorAlias || `arb_${user.id}`) : undefined,
                attachedImage
              )
              setDraft('')
              setAttachedImage(undefined)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
          >
            <svg className="icon icon-send" aria-hidden><use href="#i-send" /></svg>
          </button>
        </div>
        </section>

        <aside className="product-block deal-summary">
          <p className="deal-kicker">Escrow protection</p>
          <h3>Secure deal</h3>
          <ul className="deal-summary-list">
            <li><span>Offer</span><strong className="deal-value" title={offerTitle}>{offerTitle}</strong></li>
            <li><span>Description</span><strong className="deal-value" title={offerDescription}>{offerDescription}</strong></li>
            <li><span>Amount</span><strong className="deal-amount">{order.amountTon} TON</strong></li>
            <li><span>Status</span><strong className="deal-status-text">{orderStatusLabel}</strong></li>
          </ul>
          <div className="deal-summary-note"> Never transfer funds outside the platform.</div>
        </aside>
      </div>
    </div>
  )
}



export const MessagesPage = () => {
  const { user, orders, offers, disputes, chatMessages, sendOrderMessage } = useApp()
  const isArbitrator = ['trainee_arb', 'arb', 'senior_arb', 'admin'].includes(user.role)
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'support'>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const toEnglishSafe = (value: string) => /[А-Яа-яЁё]/.test(value) ? 'Message available' : value

  const accessibleOrders = orders.filter((order) => {
    if (!isArbitrator) {
      return order.buyerId === user.id || order.sellerId === user.id
    }

    return disputes.some((dispute) =>
      dispute.orderId === order.id &&
      isAssignedToStaff(dispute.assignedTo, user.id, user.username) &&
      ['opened', 'assigned_trainee', 'escalated_to_arb', 'escalated_to_senior'].includes(dispute.status)
    )
  })

  const threads = accessibleOrders
    .map((order) => {
      const offer = offers.find((item) => item.id === order.offerId)
      const orderDispute = disputes.find((dispute) =>
        dispute.orderId === order.id &&
        (isArbitrator ? isAssignedToStaff(dispute.assignedTo, user.id, user.username) : (order.buyerId === user.id || order.sellerId === user.id))
      )
      const peerId = order.buyerId === user.id ? order.sellerId : order.buyerId
      const orderMessages = chatMessages
        .filter((message) => message.orderId === order.id)
        .sort((a, b) => b.createdAt - a.createdAt)
      const latestMessage = orderMessages[0]
      const unreadCount = latestMessage && Date.now() - latestMessage.createdAt < 2 * 60 * 60 * 1000 ? 1 : 0

      return {
        order,
        offer,
        dispute: orderDispute,
        title: offer?.title ?? 'Order chat',
        peer: isArbitrator ? `Dispute #${orderDispute?.id.slice(-6) ?? order.id.slice(-6)}` : `Seller ${peerId}`,
        preview: toEnglishSafe(latestMessage?.text ?? 'No messages yet'),
        time: latestMessage ? new Date(latestMessage.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        unreadCount,
        hasSupport: Boolean(orderDispute)
      }
    })
    .sort((a, b) => b.order.createdAt - a.order.createdAt)

  const visibleThreads = threads.filter((thread) => {
    if (activeFilter === 'new') return thread.unreadCount > 0
    if (activeFilter === 'support') return thread.hasSupport
    return true
  })

  useEffect(() => {
    if (!visibleThreads.length) {
      setSelectedOrderId(null)
      return
    }
    if (!selectedOrderId || !visibleThreads.some((thread) => thread.order.id === selectedOrderId)) {
      setSelectedOrderId(visibleThreads[0].order.id)
    }
  }, [visibleThreads, selectedOrderId])

  const selectedThread = visibleThreads.find((thread) => thread.order.id === selectedOrderId) ?? null

  const selectedMessages = selectedThread
    ? chatMessages
      .filter((message) => message.orderId === selectedThread.order.id)
      .sort((a, b) => a.createdAt - b.createdAt)
    : []

  const sender: ChatMessage['sender'] = isArbitrator ? 'arb' : selectedThread?.order.sellerId === user.id ? 'seller' : 'buyer'

  const submitMessage = () => {
    if (!selectedThread || !draft.trim()) return
    sendOrderMessage(selectedThread.order.id, sender, draft)
    setDraft('')
  }

  const filterItems: Array<{ key: 'all' | 'new' | 'support'; label: string; icon: string }> = [
    { key: 'all', label: 'All', icon: '◉' },
    { key: 'new', label: 'New', icon: '◌' },
    { key: 'support', label: 'Support', icon: '◍' }
  ]

  return (
    <div className="messages-center">
      <section className="messages-shell">
        <aside className="messages-left-menu card" aria-label="Conversation filters">
          {filterItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`messages-filter-btn ${activeFilter === item.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(item.key)}
            >
              <span aria-hidden>{item.icon}</span>
              <small>{item.label}</small>
            </button>
          ))}
        </aside>

        <aside className="messages-list card" aria-label="Conversation list">
          <div className="messages-list-head">
            <strong>Telegram notifications</strong>
            <small>{visibleThreads.length} chats</small>
          </div>

          <div className="messages-list-scroll">
            {visibleThreads.length ? visibleThreads.map((thread) => {
              const isActive = thread.order.id === selectedOrderId
              return (
                <button
                  key={thread.order.id}
                  type="button"
                  className={`messages-thread ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedOrderId(thread.order.id)}
                >
                  <div className="messages-thread-avatar">{thread.peer.slice(0, 1).toUpperCase()}<span className="online-dot" /></div>
                  <div className="messages-thread-meta">
                    <div className="messages-thread-row">
                      <strong>{thread.peer}</strong>
                      <small>{thread.time}</small>
                    </div>
                    <p>{thread.preview}</p>
                    <div className="messages-thread-row">
                      <small>{thread.title}</small>
                      {thread.unreadCount > 0 && <span className="messages-unread">{thread.unreadCount}</span>}
                    </div>
                  </div>
                </button>
              )
            }) : <p className="muted">No conversations yet.</p>}
          </div>
        </aside>

        <section className="messages-chat card" aria-label="Chat panel">
          {!selectedThread ? (
            <div className="messages-empty-pill">Select a chat to start messaging</div>
          ) : (
            <div className="messages-chat-grid">
              <article className="messages-chat-main">
                <header className="messages-chat-head">
                  <div>
                    <strong>{selectedThread.peer}</strong>
                    <small>Online</small>
                  </div>
                  <button className="icon-btn" type="button" aria-label="More options"><EllipsisVerticalIcon /></button>
                </header>

                <div className="messages-chat-scroll">
                  {selectedMessages.length ? selectedMessages.map((message) => (
                    <div key={message.id} className={`messages-bubble ${message.sender}`}>
                      <p>{toEnglishSafe(message.text)}</p>
                      <small>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                  )) : <div className="messages-empty-pill">No messages in this chat yet.</div>}
                </div>

                <div className="messages-composer">
                  <button className="icon-btn" type="button" aria-label="Attach file"><span aria-hidden>⎔</span></button>
                  <input className="input" placeholder="Write a message..." value={draft} onChange={(event) => setDraft(event.target.value)} />
                  <button className="icon-btn send-btn" type="button" aria-label="Send" disabled={!draft.trim()} onClick={submitMessage}><SendIcon /></button>
                </div>
              </article>

              <aside className="messages-details card">
                <h3>Details</h3>
                <p className="messages-details-label">Description</p>
                <div className="messages-details-description">{selectedThread.offer?.description ?? 'Seller description is not available for this order yet.'}</div>
              </aside>
            </div>
          )}
        </section>
      </section>
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
  const [searchParams] = useSearchParams()
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
  const { disputes, orders, offers, user, assignRandomCase } = useApp()
  const [tab, setTab] = useState<'active' | 'closed' | 'all'>('active')
  const [searching, setSearching] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [searchResult, setSearchResult] = useState<string>('')
  const nav = useNavigate()
  const [searchParams] = useSearchParams()

  const isArbitrator = ['trainee_arb', 'arb', 'senior_arb', 'admin'].includes(user.role)
  const staffKey = getStaffAssigneeKey(user.id, user.username)

  useEffect(() => {
    if (!searching) return
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [searching])

  const matchesTab = (status: Dispute['status']) => {
    if (tab === 'all') return true
    const isClosed = ['final_decided', 'closed'].includes(status)
    return tab === 'closed' ? isClosed : !isClosed
  }

  const mine = disputes.filter((d) => {
    const order = orders.find((o) => o.id === d.orderId)
    if (!order) return false
    return (order.buyerId === user.id || order.sellerId === user.id) && matchesTab(d.status)
  })

  const arbPool = disputes.filter((d) => {
    const assignedToMe = isAssignedToStaff(d.assignedTo, user.id, user.username)
    return assignedToMe && matchesTab(d.status)
  })

  const userPool = mine

  const visible = isArbitrator ? arbPool : userPool

  return (
    <div className="stack">
      <div className="chips">
        <button className={`chip ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active</button>
        <button className={`chip ${tab === 'closed' ? 'active' : ''}`} onClick={() => setTab('closed')}>Closed</button>
        <button className={`chip ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All disputes</button>
      </div>

      {isArbitrator && (
        <Card>
          <h3>Arbitrator queue</h3>
          <p>Your assigned disputes only. Use search to take a new case.</p>
          <div className="chips">
            {!searching && <button className="chip active" onClick={() => {
              setSearching(true)
              setSeconds(0)
              setSearchResult('')
              const delay = 3000 + Math.floor(Math.random() * 4000)
              setTimeout(() => {
                const found = assignRandomCase(staffKey)
                if (found) {
                  setSearchResult(` Dispute found: ${found.id}`)
                  nav(`/staff/case/${found.id}`)
                } else {
                  setSearchResult('No dispute found in queue yet.')
                }
                setSearching(false)
              }, delay)
            }}>Find new dispute</button>}
            {searching && <button className="chip" onClick={() => {
              setSearching(false)
              setSearchResult('Search stopped manually.')
            }}> Stop search</button>}
          </div>
          {searching && <p>⏱ Searching... {seconds}s</p>}
          {!!searchResult && <p>{searchResult}</p>}
        </Card>
      )}

      <Card>
        {visible.length ? visible.map((d) => {
          const order = orders.find((item) => item.id === d.orderId)
          const offer = offers.find((item) => item.id === order?.offerId)
          return (
            <Link className="row" to={`/dispute/${d.id}`} key={d.id}>
              <strong>{offer?.title ?? `Order #${d.orderId.slice(-6)}`}</strong>
              <small>{d.reasonCode} · {d.status}</small>
            </Link>
          )
        }) : <p>No disputes in this view.</p>}
      </Card>
    </div>
  )
}

export const DisputeDetailsPage = () => {
  const { disputeId = '' } = useParams()
  const { disputes, cancelDispute } = useApp()
  const d = disputes.find((x) => x.id === disputeId)

  if (!d) return <p>Not found</p>

  const canAppeal = ['trainee_decided', 'arb_decided'].includes(d.status) && d.appealCount < 1
  const canCancel = ['opened', 'assigned_trainee', 'escalated_to_arb', 'escalated_to_senior'].includes(d.status)

  return (
    <div className="stack">
      <Card>
        <p>Reason: {d.reasonCode}</p>
        <p>Description: {d.message}</p>
        <p>Status: {d.status}</p>
        {d.decision && <p>Decision: {d.decision.text}</p>}
      </Card>
      <Card>
        <h4>Timeline</h4>
        <p>opened → assigned → decision → escalations</p>
        {d.decision && <p>Winner: {d.decision.winner}</p>}
      </Card>
      {canAppeal && <p>Appeal can only be initiated from the chat report menu.</p>}
      {canCancel && <button className="btn secondary" onClick={() => {
        if (!window.confirm(CANCEL_DISPUTE_WARNING)) return
        cancelDispute(d.id)
      }}>Cancel dispute</button>}
    </div>
  )
}

export const ProfilePage = () => {

  const { user, setUser } = useApp()
  const [searchParams] = useSearchParams()
  const viewedId = searchParams.get('view')
  const viewedName = searchParams.get('name')
  const viewedRole = searchParams.get('role')
  const roles: Role[] = ['user', 'seller', 'trainee_arb', 'arb', 'senior_arb', 'admin']
  const demoAccounts = [
    {
      id: 1001,
      username: 'user_1',
      role: 'seller' as Role,
      buyerRating: 4.8,
      sellerRating: 4.9,
      dealsCount: 124,
      depositTon: 120,
      depositStatus: 'active' as const,
      createdAt: user.createdAt
    },
    {
      id: 1002,
      username: 'user_2',
      role: 'user' as Role,
      buyerRating: 4.6,
      sellerRating: 4.5,
      dealsCount: 67,
      depositTon: 80,
      depositStatus: 'active' as const,
      arbWarnings: 0,
      arbDeclinesCount: 0,
      arbFreeDeclineUsed: false,
      createdAt: user.createdAt
    },
    {
      id: 3001,
      username: 'arb_alpha',
      role: 'arb' as Role,
      buyerRating: 4.9,
      sellerRating: 4.9,
      dealsCount: 700,
      depositTon: 150,
      depositStatus: 'active' as const,
      arbWarnings: 0,
      arbDeclinesCount: 0,
      arbFreeDeclineUsed: false,
      createdAt: user.createdAt
    },
    {
      id: 3002,
      username: 'arb_beta',
      role: 'arb' as Role,
      buyerRating: 4.9,
      sellerRating: 4.9,
      dealsCount: 710,
      depositTon: 155,
      depositStatus: 'active' as const,
      arbWarnings: 0,
      arbDeclinesCount: 0,
      arbFreeDeclineUsed: false,
      createdAt: user.createdAt
    }
  ]
  const settingsPrimary = [
    { icon: '', label: 'Язык', value: 'Русский' },
    { icon: '', label: 'Валюта кошелька', value: 'USD' },
    { icon: '', label: 'Часовой пояс', value: 'UTC+3' },
    { icon: '', label: 'Тема', value: 'Авто' },
    { icon: '', label: 'Настройки биржи', value: '' }
  ]

  const settingsSecondary = [
    { icon: '', label: 'Подключенные кошельки', value: '0', description: 'Вы можете привязать свой TON кошелёк, чтобы выводить средства прямо на него' },
    { icon: '', label: 'Счета', value: 'Перейти' },
    { icon: '', label: 'Чеки', value: 'Перейти' },
    { icon: '', label: 'Реферальная ссылка', value: 'Скопировать' },
    { icon: '', label: 'Поддержка', value: 'Перейти' }
  ]

  const legalLinks = [
    'Политика AML',
    'Политика конфиденциальности',
    'Общие условия использования',
    'Правила использования сайта'
  ]








  return (
    <div className="stack">
      {viewedId && viewedName && (
        <Card>
          <h3>Viewed profile</h3>
          <p>@{viewedName}</p>
          <p>User ID: {viewedId}</p>
          <p>Role: {viewedRole ?? 'user'}</p>
        </Card>
      )}
      <Card><p>@{user.username}</p><p>Role: {user.role}</p><p>Buyer {user.buyerRating} · Seller {user.sellerRating}</p><p>Arb warnings: {user.arbWarnings ?? 0}</p></Card>
      <Card><p>Deposit {user.depositTon} TON ({user.depositStatus})</p><Link to="/deposit">Manage deposit</Link></Card>
      <Card>
        <p>Switch demo account</p>
        <select className="input" value={String(user.id)} onChange={(e) => {
          const pick = demoAccounts.find((account) => String(account.id) === e.target.value)
          if (pick) setUser({ ...user, ...pick })
        }}>
          {demoAccounts.map((account) => <option key={account.id} value={account.id}>{account.username}</option>)}
        </select>
      </Card>
      <Card>
        <p>Role switch (MVP debug)</p>
        <select className="input" value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value as Role })}>
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
      </Card>

      <Card>
        <h3>Settings</h3>
        {PROFILE_SETTINGS_PRIMARY.map((item) => (
          <div className="row" key={item.label}>
            <strong>{(() => { const Icon = settingsIconMap[item.icon]; return <><Icon className="settings-row-icon" /> {item.label}</> })()}</strong>
            <small>{item.value} ›</small>
          </div>
        ))}
      </Card>

      <Card>
        <h4>Support</h4>
        <Link className="row" to="/profile/support">
          <strong> Open support center</strong>
          <small>Choose complaint, disputes, FAQ and more ›</small>
        </Link>
      </Card>

      <Card>
        {PROFILE_LEGAL_LINKS.map((item) => (
          <div className="row" key={item}>
            <strong>{item}</strong>
            <small>›</small>
          </div>
        ))}
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
  const staffKey = getStaffAssigneeKey(user.id, user.username)
  const now = Date.now()
  const cooldownMinLeft = Math.max(0, Math.ceil(((user.arbDeclineCooldownUntil ?? 0) - now) / 60000))
  const suspendedDaysLeft = Math.max(0, Math.ceil(((user.arbSuspendedUntil ?? 0) - now) / (24 * 60 * 60000)))
  const cannotTake = (user.arbSuspendedUntil ?? 0) > now || (user.arbDeclineCooldownUntil ?? 0) > now

  return (
    <div className="stack">
      <button
        className="btn"
        onClick={() => {
          if (cannotTake) {
            setMessage((user.arbSuspendedUntil ?? 0) > now ? `Suspended for ${suspendedDaysLeft} day(s).` : `Cooldown active: ${cooldownMinLeft} min left.`)
            return
          }
          const d = assignRandomCase(staffKey)
          if (d) {
            nav(`/staff/case/${d.id}`)
            return
          }
          setMessage('No available disputes in queue.')
        }}
      >
        Assign me next case
      </button>
      {cannotTake && <Card><p>{(user.arbSuspendedUntil ?? 0) > now ? `Suspended for ${suspendedDaysLeft} day(s).` : `Cooldown active: ${cooldownMinLeft} min left.`}</p></Card>}
      {message && <Card><p>{message}</p></Card>}
    </div>
  )
}

export const StaffCasePage = () => {
  const { disputeId = '' } = useParams()
  const { disputes, orders, offers, decideDispute, declineAssignedCase, user } = useApp()
  const nav = useNavigate()
  const d = disputes.find((x) => x.id === disputeId)
  const [winner, setWinner] = useState<'buyer' | 'seller'>('buyer')
  const [text, setText] = useState('')
  const [declineReasonType, setDeclineReasonType] = useState<'unjustified' | 'lack_expertise'>('unjustified')
  const [declineText, setDeclineText] = useState('')

  if (!d) return <p>Case not found</p>

  const order = orders.find((item) => item.id === d.orderId)
  const offer = offers.find((item) => item.id === order?.offerId)
  const gameTitle = games.find((game) => game.id === offer?.gameId)?.title ?? offer?.gameId ?? '-'
  const canReviewCase = isAssignedToStaff(d.assignedTo, user.id, user.username)
  const decisionLocked = ['trainee_decided', 'arb_decided', 'final_decided', 'closed'].includes(d.status)

  if (!canReviewCase) {
    return (
      <div className="stack">
        <Card>
          <h3>Case access restricted</h3>
          <p>This dispute is not assigned to you.</p>
          <Link className="btn" to="/staff/queue">Back to queue</Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="stack">
      <Card>
        <h3>Anonymous case {d.id}</h3>
        <p>Order reference: #{d.orderId.slice(-6)}</p>
        <p>Game: {gameTitle}</p>
        <p>Category: {offer?.category ?? '-'}</p>
        <p>What was bought: {offer?.title ?? order?.offerId ?? '-'}</p>
        <p>Description: {offer?.description ?? '-'}</p>
        <p>Claim details: {d.message}</p>
        {d.evidence.map((e, i) => <p key={i}>{e.type}: {e.url}</p>)}
      </Card>
      <div className="chips">
        <button className={`chip ${winner === 'buyer' ? 'active' : ''}`} onClick={() => setWinner('buyer')}>Buyer wins</button>
        <button className={`chip ${winner === 'seller' ? 'active' : ''}`} onClick={() => setWinner('seller')}>Seller wins</button>
        <Link className="chip" to={`/order/${d.orderId}/chat?dispute=${d.id}`}>Join dispute chat</Link>
      </div>
      <textarea className="input" placeholder="Detailed decision: what facts/evidence point to this winner" value={text} onChange={(e) => setText(e.target.value)} disabled={decisionLocked} />
      {!['senior_arb', 'admin'].includes(user.role) && !decisionLocked && (
        <Card>
          <h4>Decline assigned appeal</h4>
          <select className="input" value={declineReasonType} onChange={(event) => setDeclineReasonType(event.target.value as 'unjustified' | 'lack_expertise')}>
            <option value="unjustified">Unjustified decline</option>
            <option value="lack_expertise">I do not know how to solve this case</option>
          </select>
          <textarea className="input" placeholder="Explain in detail why you decline this case" value={declineText} onChange={(event) => setDeclineText(event.target.value)} />
          <button className="btn secondary" onClick={() => {
            const result = declineAssignedCase(d.id, declineText, declineReasonType)
            window.alert(result.message)
            if (result.ok) nav('/staff/queue')
          }}>Decline case</button>
        </Card>
      )}
      <button className="btn" disabled={decisionLocked} onClick={() => {
        const decisionText = text.trim()
        if (decisionText.length < 30) {
          window.alert('Please provide a detailed explanation (at least 30 characters).')
          return
        }
        decideDispute(d.id, winner, decisionText, String(user.id))
        nav('/staff')
      }}>
        Submit decision
      </button>
      {decisionLocked && <p>Decision already submitted for this case.</p>}
    </div>
  )
}

export const StaffKycPage = () => <div className="stack"><Card><h3>Arbitrator KYC</h3><p>Status: Verified (mock)</p></Card></div>

export const RoleGate = ({ children }: { children: ReactElement }) => {
  const { user } = useApp()
  const allowed = useMemo(() => ['trainee_arb', 'arb', 'senior_arb', 'admin'].includes(user.role), [user.role])
  return allowed ? children : <p>Staff access only.</p>
}
