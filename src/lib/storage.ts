import { defaultDisputes, defaultOffers, mockUser } from './mockData'
import type { ChatMessage, Dispute, Offer, Order, User } from '../types'

const keys = {
  user: 'looton_user',
  offers: 'looton_offers',
  orders: 'looton_orders',
  disputes: 'looton_disputes',
  chats: 'looton_chats'
}

const load = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const save = <T,>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value))

export const db = {
  getUser: () => load<User>(keys.user, mockUser),
  setUser: (u: User) => save(keys.user, u),
  getOffers: () => load<Offer[]>(keys.offers, defaultOffers),
  setOffers: (o: Offer[]) => save(keys.offers, o),
  getOrders: () => load<Order[]>(keys.orders, []),
  setOrders: (o: Order[]) => save(keys.orders, o),
  getDisputes: () => load<Dispute[]>(keys.disputes, defaultDisputes),
  setDisputes: (d: Dispute[]) => save(keys.disputes, d),
  getChats: () => load<ChatMessage[]>(keys.chats, []),
  setChats: (c: ChatMessage[]) => save(keys.chats, c)
}
