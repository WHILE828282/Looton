export type Role = 'user' | 'seller' | 'trainee_arb' | 'arb' | 'senior_arb' | 'admin'

export interface User {
  id: number
  username: string
  role: Role
  buyerRating: number
  sellerRating: number
  dealsCount: number
  depositTon: number
  depositStatus: 'none' | 'active' | 'withdrawal_pending'
  withdrawalRequestedAt?: number
  arbWarnings?: number
  arbDeclinesCount?: number
  arbFreeDeclineUsed?: boolean
  arbDeclineCooldownUntil?: number
  arbSuspendedUntil?: number
  createdAt: number
}

export interface Game {
  id: string
  title: string
  iconUrl?: string
  tags: string[]
}

export type OfferCategory = 'currency' | 'items' | 'accounts' | 'services' | 'subscriptions' | 'gifts'
export type OfferDeliveryType = 'instant' | 'manual'
export type OfferPayoutPolicy = 'instant_if_deposit' | 'hold_24h'

export interface Offer {
  id: string
  gameId: string
  category: OfferCategory
  title: string
  description: string
  priceTon: number
  stock?: number
  deliveryType: OfferDeliveryType
  payoutPolicy: OfferPayoutPolicy
  sellerId: number
  sellerStats: { rating: number; deals: number; depositTon: number }
  rules: { autoCloseHours: number; warrantyText: string }
  createdAt: number
}

export type OrderStatus =
  | 'created'
  | 'paid'
  | 'delivering'
  | 'delivered'
  | 'confirmed'
  | 'auto_confirmed'
  | 'disputed'
  | 'resolved_buyer'
  | 'resolved_seller'
  | 'cancelled'

export interface Order {
  id: string
  offerId: string
  buyerId: number
  sellerId: number
  amountTon: number
  feeTon: number
  status: OrderStatus
  createdAt: number
  paidAt?: number
  closedAt?: number
  timers: { payUntil: number; confirmUntil: number }
  chatLink?: string
}

export interface DisputeEvidence {
  type: 'image' | 'video' | 'text' | 'link'
  url: string
  createdAt: number
}

export interface Dispute {
  id: string
  orderId: string
  openedBy: 'buyer' | 'seller'
  reasonCode: 'not_received' | 'invalid' | 'restored_account' | 'other'
  message: string
  evidence: DisputeEvidence[]
  status:
    | 'opened'
    | 'assigned_trainee'
    | 'trainee_decided'
    | 'escalated_to_arb'
    | 'arb_decided'
    | 'escalated_to_senior'
    | 'final_decided'
    | 'closed'
  assignedTo?: string
  arbitratorAlias?: string
  decision?: {
    winner: 'buyer' | 'seller'
    text: string
    decidedBy: string
    decidedAt: number
    penalties?: string
  }
  appealCount: number
}

export interface StaffMetrics {
  workerId: string
  resolvedCount: number
  warnings: number
  level: 'trainee' | 'arb' | 'senior'
}


export interface ChatMessage {
  id: string
  orderId: string
  sender: 'system' | 'buyer' | 'seller' | 'arb'
  text: string
  createdAt: number
  arbAlias?: string
  imageUrl?: string
  status?: 'sent' | 'delivered' | 'read'
  deliveredAt?: number
  readAt?: number
}

export type Product = {
  id: string
  title: string
  deliveryMethod: string
  stockText: string
  deliveryTimeText: string
  category?: string
  sellerDescription: string
}

export type Review = {
  id: string
  createdAt: string
  relativeLabel: string
  productLabel: string
  priceRub: number
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  sellerReply?: {
    text: string
    createdAt?: string
  }
}

export type ProductChatMessage = {
  id: string
  createdAt: string
  author: 'buyer' | 'seller'
  text: string
  rating?: 1 | 2 | 3 | 4 | 5
  orderMeta?: { productLabel: string; priceRub: number }
}
