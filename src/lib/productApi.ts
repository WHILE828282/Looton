import type { Product, Review } from '../types'

const mockProducts: Record<string, Product> = {
  'offer-1': {
    id: 'offer-1',
    title: 'Robux Roblox',
    deliveryMethod: 'Game Pass (5 days)',
    stockText: '18 445 units available',
    deliveryTimeText: '1 minute – 1 day',
    category: 'Roblox Currency',
    sellerDescription:
      '👋 Hello! You can buy Robux at any time.\n\n🤖 Auto-delivery is enabled and all fees are on me.\n\nℹ️ After payment, you will get clear step-by-step instructions for setting the correct Game Pass price.\n\n📋 Please read the commands section below before ordering.\n\n✅ Fast support and smooth deals every day.',
    commands: [
      { cmd: '!calc 1000', description: 'calculate Game Pass price for 1000 Robux' },
      { cmd: '!rate', description: 'show the latest exchange rate in TON' },
      { cmd: '!myorders', description: 'show your last 10 completed orders' },
      { cmd: '!help', description: 'open quick setup and FAQ' }
    ]
  }
}

const seededReviews: Review[] = [
  {
    id: 'r-1',
    createdAt: '2026-03-01T10:00:00.000Z',
    relativeLabel: 'This week',
    productLabel: 'Roblox',
    priceRub: 800,
    rating: 5,
    text: 'Everything was perfect. Super fast delivery!',
    sellerReply: { text: 'Thank you for your review!' }
  },
  {
    id: 'r-2',
    createdAt: '2026-02-27T11:00:00.000Z',
    relativeLabel: 'This week',
    productLabel: 'Roblox',
    priceRub: 500,
    rating: 5,
    text: 'Second purchase. Reliable seller, recommended.',
    sellerReply: { text: 'Appreciate it! You are always welcome.' }
  },
  {
    id: 'r-3',
    createdAt: '2026-02-22T11:00:00.000Z',
    relativeLabel: '7 days ago',
    productLabel: 'Roblox',
    priceRub: 150,
    rating: 5,
    text: 'Great price and quick process.'
  },
  {
    id: 'r-4',
    createdAt: '2026-02-18T08:00:00.000Z',
    relativeLabel: 'This month',
    productLabel: 'Roblox',
    priceRub: 900,
    rating: 4,
    text: 'Good overall, took a little longer than expected.',
    sellerReply: { text: 'Thanks! We are working on even faster delivery.' }
  }
]

const allReviewsByProduct: Record<string, Review[]> = {
  'offer-1': Array.from({ length: 28 }).map((_, index) => {
    const base = seededReviews[index % seededReviews.length]
    return {
      ...base,
      id: `${base.id}-${index + 1}`,
      priceRub: base.priceRub + (index % 4) * 50
    }
  })
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const productApi = {
  async getProduct(id: string): Promise<Product> {
    // API contract: GET /api/products/:id
    await wait(180)
    return mockProducts[id] ?? mockProducts['offer-1']
  },
  async getReviews(params: { id: string; cursor?: string | null; limit?: number }): Promise<{ items: Review[]; nextCursor: string | null }> {
    // API contract: GET /api/products/:id/reviews?cursor=...&limit=10
    await wait(220)
    const list = allReviewsByProduct[params.id] ?? allReviewsByProduct['offer-1']
    const limit = params.limit ?? 10
    const start = params.cursor ? Number(params.cursor) : 0
    const items = list.slice(start, start + limit)
    const nextCursor = start + limit < list.length ? String(start + limit) : null
    return { items, nextCursor }
  }
}
