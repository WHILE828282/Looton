import type { OfferCategory } from '../types'
import type { Product, ProductChatMessage } from '../types'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const categoryDetails: Record<OfferCategory, { categoryTitle: string; description: string }> = {
  currency: {
    categoryTitle: 'Game Currency',
    description: '⚡ Fast balance top-ups with clear transfer instructions and delivery confirmation in chat.'
  },
  items: {
    categoryTitle: 'In-game Items',
    description: '🎁 Safe item transfer flow with proof steps and quick support directly in the seller chat.'
  },
  accounts: {
    categoryTitle: 'Game Accounts',
    description: '🔐 Account transfer with secure handover checklist and post-delivery confirmation.'
  },
  services: {
    categoryTitle: 'Game Services',
    description: '🛠️ Service orders with transparent progress updates and agreed completion milestones.'
  },
  subscriptions: {
    categoryTitle: 'Subscriptions',
    description: '📦 Subscription activation workflow with expected activation time and support guidance.'
  },
  gifts: {
    categoryTitle: 'Digital Gifts',
    description: '🎉 Gift delivery with recipient verification and instant status updates in chat.'
  }
}

const chatTemplates: Array<Omit<ProductChatMessage, 'id'>> = [
  {
    createdAt: '2026-03-01T10:00:00.000Z',
    author: 'buyer',
    text: 'Hello! I completed the payment, can you check my order?',
    rating: 5,
    orderMeta: { productLabel: 'Order', priceRub: 800 }
  },
  {
    createdAt: '2026-03-01T10:01:00.000Z',
    author: 'seller',
    text: 'Got it. Please send your game nickname and I will complete it right now.'
  },
  {
    createdAt: '2026-03-01T10:04:00.000Z',
    author: 'buyer',
    text: 'Sent. Everything looks good so far, thanks!',
    orderMeta: { productLabel: 'Order', priceRub: 500 }
  }
]

const buildProduct = (params: { id: string; fallbackTitle?: string; category?: OfferCategory }): Product => {
  const category = params.category ? categoryDetails[params.category] : undefined
  return {
    id: params.id,
    title: params.fallbackTitle ?? 'Digital Product',
    deliveryMethod: 'Automated / Manual',
    stockText: 'Live stock available',
    deliveryTimeText: '1 minute – 1 day',
    category: category?.categoryTitle ?? 'Marketplace Goods',
    sellerDescription: category?.description ?? '💬 Contact seller before payment for the fastest and safest delivery.'
  }
}

const buildChat = (productId: string, productLabel?: string): ProductChatMessage[] => {
  return Array.from({ length: 18 }).map((_, index) => {
    const base = chatTemplates[index % chatTemplates.length]
    const dayOffset = Math.floor(index / 6)
    const createdAt = new Date(Date.UTC(2026, 2, 1 + dayOffset, 10, index % 60)).toISOString()

    return {
      ...base,
      createdAt,
      id: `${productId}-m-${index + 1}`,
      orderMeta: base.orderMeta
        ? {
            ...base.orderMeta,
            productLabel: productLabel ?? base.orderMeta.productLabel,
            priceRub: base.orderMeta.priceRub + (index % 3) * 100
          }
        : undefined
    }
  })
}

export const productApi = {
  async getProduct(params: { id: string; fallbackTitle?: string; category?: OfferCategory }): Promise<Product> {
    await wait(120)
    return buildProduct(params)
  },
  async getChatMessages(params: {
    id: string
    cursor?: string | null
    limit?: number
    productLabel?: string
  }): Promise<{ items: ProductChatMessage[]; nextCursor: string | null }> {
    await wait(180)
    const list = buildChat(params.id, params.productLabel)
    const limit = params.limit ?? 20
    const end = params.cursor ? Number(params.cursor) : list.length
    const start = Math.max(0, end - limit)
    const items = list.slice(start, end)
    const nextCursor = start > 0 ? String(start) : null
    return { items, nextCursor }
  }
}
