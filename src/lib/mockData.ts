import type { Dispute, Game, Offer, User } from '../types'

export const DEPOSIT_THRESHOLD = 100

export const mockUser: User = {
  id: 1001,
  username: 'demo_user',
  role: 'seller',
  buyerRating: 4.8,
  sellerRating: 4.9,
  dealsCount: 124,
  depositTon: 120,
  depositStatus: 'active',
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60
}

export const games: Game[] = [
  { id: 'mlbb', title: 'Mobile Legends', iconUrl: '/games/mlbb/cover.jpg', tags: ['MOBA', 'Top-up'] },
  { id: 'gta5', title: 'GTA 5', iconUrl: '/games/gta5/cover.jpg', tags: ['Accounts', 'Boost'] },
  { id: 'cs2', title: 'CS2', iconUrl: '/games/cs2/cover.jpg', tags: ['Skins', 'Prime'] }
]

export const defaultOffers: Offer[] = [
  {
    id: 'off-1',
    gameId: 'mlbb',
    category: 'currency',
    title: 'Weekly Diamond Pass',
    description: 'Fast top-up in 5 minutes via ID.',
    priceTon: 12,
    deliveryType: 'instant',
    payoutPolicy: 'instant_if_deposit',
    sellerId: 2001,
    sellerStats: { rating: 4.9, deals: 1023, depositTon: 250 },
    rules: { autoCloseHours: 24, warrantyText: 'Refund if not delivered in 20 minutes.' },
    createdAt: Date.now() - 86400000
  },
  {
    id: 'off-2',
    gameId: 'gta5',
    category: 'items',
    title: 'GTA 5 Premium Account Service',
    description: 'Manual transfer with safety checks and setup guide.',
    priceTon: 55,
    deliveryType: 'manual',
    payoutPolicy: 'hold_24h',
    sellerId: 2002,
    sellerStats: { rating: 4.6, deals: 280, depositTon: 20 },
    rules: { autoCloseHours: 24, warrantyText: '24h restoration warranty.' },
    createdAt: Date.now() - 3600000
  },
  {
    id: 'off-3',
    gameId: 'cs2',
    category: 'accounts',
    title: 'Prime Ready CS2 Account',
    description: 'Verified account with setup notes.',
    priceTon: 80,
    deliveryType: 'manual',
    payoutPolicy: 'instant_if_deposit',
    sellerId: 2003,
    sellerStats: { rating: 4.8, deals: 410, depositTon: 110 },
    rules: { autoCloseHours: 24, warrantyText: 'No recovery guarantee.' },
    createdAt: Date.now() - 2400000
  },
  {
    id: 'off-4',
    gameId: 'pubg',
    category: 'currency',
    title: 'PUBG UC Top-up',
    description: 'Instant UC delivery to your PUBG account.',
    priceTon: 18,
    deliveryType: 'instant',
    payoutPolicy: 'instant_if_deposit',
    sellerId: 2004,
    sellerStats: { rating: 4.7, deals: 530, depositTon: 140 },
    rules: { autoCloseHours: 24, warrantyText: 'Re-send if UC is not credited in 15 minutes.' },
    createdAt: Date.now() - 1800000
  }
]

export const defaultDisputes: Dispute[] = [
  {
    id: 'disp-1',
    orderId: 'ord-stub',
    openedBy: 'buyer',
    reasonCode: 'invalid',
    message: 'Received wrong item quality.',
    evidence: [{ type: 'text', url: 'Screenshot and message log attached.', createdAt: Date.now() - 120000 }],
    status: 'opened',
    appealCount: 0
  }
]

export const categories = ['currency', 'items', 'accounts', 'services', 'subscriptions', 'gifts'] as const
