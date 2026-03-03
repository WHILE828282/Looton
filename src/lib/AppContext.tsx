import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { db } from './storage'
import { calcFee, isInstantEligible } from './domain'
import type { ChatMessage, Dispute, Offer, Order, User } from '../types'

type DisputeStatus = Dispute['status']

type AppState = {
  user: User
  offers: Offer[]
  orders: Order[]
  disputes: Dispute[]
  chatMessages: ChatMessage[]
  setUser: (user: User) => void
  addOffer: (offer: Offer) => void
  createOrder: (offer: Offer) => Order
  updateOrder: (orderId: string, patch: Partial<Order>) => void
  openDispute: (orderId: string, message: string, openedBy?: 'buyer' | 'seller', reasonCode?: Dispute['reasonCode']) => Dispute
  assignRandomCase: (workerId: string) => Dispute | undefined
  decideDispute: (disputeId: string, winner: 'buyer' | 'seller', text: string, decidedBy: string) => void
  appealDispute: (disputeId: string) => void
  cancelDispute: (disputeId: string) => void
  sendOrderMessage: (orderId: string, sender: 'buyer' | 'seller', text: string) => void
}

const Context = createContext<AppState | null>(null)

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

const queueStatuses: readonly DisputeStatus[] = ['opened', 'escalated_to_arb', 'escalated_to_senior']

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [user, setUserState] = useState(db.getUser())
  const [offers, setOffers] = useState(db.getOffers())
  const [orders, setOrders] = useState(db.getOrders())
  const [disputes, setDisputes] = useState(db.getDisputes())
  const [chatMessages, setChatMessages] = useState(db.getChats())

  const setUser = (next: User) => {
    setUserState(next)
    db.setUser(next)
  }

  const addOffer = (offer: Offer) => {
    setOffers((prev) => {
      const next = [...prev, offer]
      db.setOffers(next)
      return next
    })
  }

  const appendChatMessage = (message: ChatMessage) => {
    setChatMessages((prev) => {
      const next = [message, ...prev]
      db.setChats(next)
      return next
    })
  }

  const createOrder = (offer: Offer): Order => {
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

    setOrders((prev) => {
      const next = [order, ...prev]
      db.setOrders(next)
      return next
    })

    appendChatMessage({
      id: uid('chat'),
      orderId: order.id,
      sender: 'system',
      text: '✅ Buyer payment confirmed. Funds are secured in escrow.',
      createdAt: now
    })

    return order
  }

  const updateOrder = (orderId: string, patch: Partial<Order>) => {
    setOrders((prev) => {
      const next = prev.map((item) => (item.id === orderId ? { ...item, ...patch } : item))
      db.setOrders(next)
      return next
    })
  }

  const openDispute = (
    orderId: string,
    message: string,
    openedBy: 'buyer' | 'seller' = 'buyer',
    reasonCode: Dispute['reasonCode'] = 'other'
  ): Dispute => {
    updateOrder(orderId, { status: 'disputed' })

    const dispute: Dispute = {
      id: uid('disp'),
      orderId,
      openedBy,
      reasonCode,
      message,
      evidence: [{ type: 'text', url: message, createdAt: Date.now() }],
      status: 'opened',
      appealCount: 0
    }

    setDisputes((prev) => {
      const next = [dispute, ...prev]
      db.setDisputes(next)
      return next
    })

    return dispute
  }

  const assignRandomCase = (workerId: string): Dispute | undefined => {
    const available = disputes.filter((d) => queueStatuses.includes(d.status) && !d.assignedTo)
    if (!available.length) {
      return undefined
    }

    const pick = available[Math.floor(Math.random() * available.length)]
    const assignedStatus: DisputeStatus = pick.status === 'opened' ? 'assigned_trainee' : pick.status

    const next: Dispute[] = disputes.map((d) =>
      d.id === pick.id ? { ...d, assignedTo: workerId, status: assignedStatus } : d
    )

    setDisputes(next)
    db.setDisputes(next)

    return next.find((d) => d.id === pick.id)
  }

  const decideDispute = (disputeId: string, winner: 'buyer' | 'seller', text: string, decidedBy: string) => {
    const next: Dispute[] = disputes.map((d) => {
      if (d.id !== disputeId) {
        return d
      }

      const status: DisputeStatus =
        user.role === 'senior_arb' ? 'final_decided' : user.role === 'arb' ? 'arb_decided' : 'trainee_decided'

      return {
        ...d,
        status,
        decision: {
          winner,
          text,
          decidedBy,
          decidedAt: Date.now()
        }
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
    setDisputes((prev) => {
      const next: Dispute[] = prev.map((d) => {
        if (d.id !== disputeId || d.appealCount >= 1) {
          return d
        }

        const status: DisputeStatus =
          d.status === 'trainee_decided'
            ? 'escalated_to_arb'
            : d.status === 'arb_decided'
              ? 'escalated_to_senior'
              : d.status

        return {
          ...d,
          status,
          appealCount: d.appealCount + 1,
          assignedTo: undefined
        }
      })

      db.setDisputes(next)
      return next
    })
  }

  const cancelDispute = (disputeId: string) => {
    const target = disputes.find((d) => d.id === disputeId)
    if (!target) return

    setDisputes((prev) => {
      const next: Dispute[] = prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: 'closed',
              message: `${d.message}\n[System] Dispute was cancelled by the user.`
            }
          : d
      )

      db.setDisputes(next)
      return next
    })

    updateOrder(target.orderId, { status: 'resolved_seller', closedAt: Date.now() })

    appendChatMessage({
      id: uid('chat'),
      orderId: target.orderId,
      sender: 'system',
      text: '⚠️ Dispute cancelled. Escrow protection was stopped by user action.',
      createdAt: Date.now()
    })
  }

  const sendOrderMessage = (orderId: string, sender: 'buyer' | 'seller', text: string) => {
    const message = text.trim()
    if (!message) return

    appendChatMessage({
      id: uid('chat'),
      orderId,
      sender,
      text: message,
      createdAt: Date.now()
    })
  }

  const value = useMemo(
    () => ({
      user,
      offers,
      orders,
      disputes,
      chatMessages,
      setUser,
      addOffer,
      createOrder,
      updateOrder,
      openDispute,
      assignRandomCase,
      decideDispute,
      appealDispute,
      cancelDispute,
      sendOrderMessage
    }),
    [user, offers, orders, disputes, chatMessages]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useApp = () => {
  const ctx = useContext(Context)
  if (!ctx) {
    throw new Error('AppContext missing')
  }

  return ctx
}
