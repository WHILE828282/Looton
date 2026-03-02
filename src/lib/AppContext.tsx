import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { db } from './storage'
import { calcFee, isInstantEligible } from './domain'
import type { Dispute, Offer, Order, User } from '../types'

type DisputeStatus = Dispute['status']

type AppState = {
  user: User
  offers: Offer[]
  orders: Order[]
  disputes: Dispute[]
  setUser: (user: User) => void
  addOffer: (offer: Offer) => void
  createOrder: (offer: Offer) => Order
  updateOrder: (orderId: string, patch: Partial<Order>) => void
  openDispute: (orderId: string, message: string, openedBy?: 'buyer' | 'seller') => Dispute
  assignRandomCase: (workerId: string) => Dispute | undefined
  decideDispute: (disputeId: string, winner: 'buyer' | 'seller', text: string, decidedBy: string) => void
  appealDispute: (disputeId: string) => void
}

const Context = createContext<AppState | null>(null)
const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [user, setUserState] = useState(db.getUser())
  const [offers, setOffers] = useState(db.getOffers())
  const [orders, setOrders] = useState(db.getOrders())
  const [disputes, setDisputes] = useState(db.getDisputes())

  const setUser = (next: User) => {
    setUserState(next)
    db.setUser(next)
  }

  const addOffer = (offer: Offer) => {
    const next = [offer, ...offers]
    setOffers(next)
    db.setOffers(next)
  }

  const createOrder = (offer: Offer) => {
    const now = Date.now()
    const order: Order = {
      id: uid('ord'),
      offerId: offer.id,
      buyerId: user.id,
      sellerId: offer.sellerId,
      amountTon: offer.priceTon,
      feeTon: calcFee(offer.priceTon),
      status: 'paid',
      createdAt: now,
      paidAt: now,
      timers: {
        payUntil: now + 15 * 60 * 1000,
        confirmUntil: now + offer.rules.autoCloseHours * 60 * 60 * 1000
      }
    }
    const next = [order, ...orders]
    setOrders(next)
    db.setOrders(next)
    return order
  }

  const updateOrder = (orderId: string, patch: Partial<Order>) => {
    const next = orders.map((it) => (it.id === orderId ? { ...it, ...patch } : it))
    setOrders(next)
    db.setOrders(next)
  }

  const openDispute = (orderId: string, message: string, openedBy: 'buyer' | 'seller' = 'buyer') => {
    updateOrder(orderId, { status: 'disputed' })
    const dispute: Dispute = {
      id: uid('disp'),
      orderId,
      openedBy,
      reasonCode: 'other',
      message,
      evidence: [{ type: 'text', url: message, createdAt: Date.now() }],
      status: 'opened',
      appealCount: 0
    }
    const next = [dispute, ...disputes]
    setDisputes(next)
    db.setDisputes(next)
    return dispute
  }

  const assignRandomCase = (workerId: string) => {
    const available = disputes.filter((d) => ['opened', 'escalated_to_arb', 'escalated_to_senior'].includes(d.status) && !d.assignedTo)
    if (!available.length) return undefined
    const pick = available[Math.floor(Math.random() * available.length)]
    const assignedStatus: DisputeStatus = pick.status === 'opened' ? 'assigned_trainee' : pick.status
    const next: Dispute[] = disputes.map((d) => (d.id === pick.id ? { ...d, assignedTo: workerId, status: assignedStatus } : d))
    setDisputes(next)
    db.setDisputes(next)
    return next.find((d) => d.id === pick.id)
  }

  const decideDispute = (disputeId: string, winner: 'buyer' | 'seller', text: string, decidedBy: string) => {
    const next: Dispute[] = disputes.map((d) => {
      if (d.id !== disputeId) return d
      return {
        ...d,
        status: (user.role === 'senior_arb' ? 'final_decided' : user.role === 'arb' ? 'arb_decided' : 'trainee_decided') as DisputeStatus,
        decision: { winner, text, decidedBy, decidedAt: Date.now() }
      }
    })

    const dispute = next.find((d) => d.id === disputeId)
    if (dispute) {
      const orderStatus = winner === 'buyer' ? 'resolved_buyer' : 'resolved_seller'
      updateOrder(dispute.orderId, { status: orderStatus, closedAt: Date.now() })
      if (winner === 'buyer' && isInstantEligible(user)) {
        setUser({ ...user, depositTon: Math.max(0, user.depositTon - 5) })
      }
    }

    setDisputes(next)
    db.setDisputes(next)
  }

  const appealDispute = (disputeId: string) => {
    const next: Dispute[] = disputes.map((d) => {
      if (d.id !== disputeId || d.appealCount >= 1) return d
      const status: DisputeStatus = d.status === 'trainee_decided' ? 'escalated_to_arb' : d.status === 'arb_decided' ? 'escalated_to_senior' : d.status
      return { ...d, status, appealCount: d.appealCount + 1, assignedTo: undefined }
    })
    setDisputes(next)
    db.setDisputes(next)
  }

  const value = useMemo(
    () => ({
      user,
      offers,
      orders,
      disputes,
      setUser,
      addOffer,
      createOrder,
      updateOrder,
      openDispute,
      assignRandomCase,
      decideDispute,
      appealDispute
    }),
    [user, offers, orders, disputes]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useApp = () => {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('AppContext missing')
  return ctx
}
