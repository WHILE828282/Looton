import { db } from './storage'
import type { Dispute, Offer, Order } from '../types'

// Thin API wrappers for MVP; replace bodies with real HTTP/contract calls later.
export const offersApi = {
  list: async (): Promise<Offer[]> => db.getOffers(),
  create: async (offer: Offer): Promise<Offer> => {
    const next = [offer, ...db.getOffers()]
    db.setOffers(next)
    return offer
  }
}

export const ordersApi = {
  list: async (): Promise<Order[]> => db.getOrders(),
  upsert: async (order: Order): Promise<Order> => {
    const orders = db.getOrders()
    const idx = orders.findIndex((o) => o.id === order.id)
    if (idx >= 0) orders[idx] = order
    else orders.unshift(order)
    db.setOrders(orders)
    return order
  }
}

export const disputesApi = {
  list: async (): Promise<Dispute[]> => db.getDisputes(),
  upsert: async (dispute: Dispute): Promise<Dispute> => {
    const disputes = db.getDisputes()
    const idx = disputes.findIndex((d) => d.id === dispute.id)
    if (idx >= 0) disputes[idx] = dispute
    else disputes.unshift(dispute)
    db.setDisputes(disputes)
    return dispute
  }
}
