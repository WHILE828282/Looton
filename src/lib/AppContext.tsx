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
  sendOrderMessage: (orderId: string, sender: 'buyer' | 'seller' | 'arb', text: string, arbAlias?: string, imageUrl?: string) => void
  joinDisputeChat: (disputeId: string, arbAlias: string) => void
  declineAssignedCase: (
    disputeId: string,
    reasonText: string,
    reasonType: 'unjustified' | 'lack_expertise'
  ) => { ok: boolean; message: string }
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
      text: ' Buyer payment confirmed. Funds are secured in escrow.',
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
    const now = Date.now()
    const autoAssignedArbId = 'arb_3001'
    const autoAssignedAlias = 'arb_alpha'

    updateOrder(orderId, { status: 'disputed' })

    const dispute: Dispute = {
      id: uid('disp'),
      orderId,
      openedBy,
      reasonCode,
      message,
      evidence: [{ type: 'text', url: message, createdAt: now }],
      status: 'assigned_trainee',
      assignedTo: autoAssignedArbId,
      arbitratorAlias: autoAssignedAlias,
      appealCount: 0
    }

    setDisputes((prev) => {
      const next = [dispute, ...prev]
      db.setDisputes(next)
      return next
    })

    appendChatMessage({
      id: uid('chat'),
      orderId,
      sender: 'system',
      text: ' Dispute opened. Assigned arbitrator will join this chat now.',
      createdAt: now
    })

    appendChatMessage({
      id: uid('chat'),
      orderId,
      sender: 'system',
      text: ` Dispute ${dispute.id} assigned to arbitrator ${autoAssignedAlias}.`,
      createdAt: now + 1
    })

    appendChatMessage({
      id: uid('chat'),
      orderId,
      sender: 'arb',
      arbAlias: autoAssignedAlias,
      text: 'Hello, I am your assigned arbitrator. Please provide order details and evidence in this chat.',
      createdAt: now + 2
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

    const defaultAlias = pick.arbitratorAlias || `arb_${workerId}`
    const next: Dispute[] = disputes.map((d) =>
      d.id === pick.id ? { ...d, assignedTo: workerId, status: assignedStatus, arbitratorAlias: defaultAlias } : d
    )

    setDisputes(next)
    db.setDisputes(next)

    appendChatMessage({
      id: uid('chat'),
      orderId: pick.orderId,
      sender: 'system',
      text: ` Dispute ${pick.id} assigned to arbitrator ${defaultAlias}.`,
      createdAt: Date.now()
    })

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

      appendChatMessage({
        id: uid('chat'),
        orderId: dispute.orderId,
        sender: 'system',
        text: ` Dispute resolved: ${winner} wins. Reason: ${text.trim() || 'Decision submitted.'}`,
        createdAt: Date.now()
      })

      if (winner === 'buyer' && isInstantEligible(user)) {
        setUser({ ...user, depositTon: Math.max(0, user.depositTon - 5) })
      }
    }

    setDisputes(next)
    db.setDisputes(next)
  }

  const appealDispute = (disputeId: string) => {
    let escalatedOrderId: string | undefined

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

        if (status !== d.status) {
          escalatedOrderId = d.orderId
        }

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

    if (escalatedOrderId) {
      appendChatMessage({
        id: uid('chat'),
        orderId: escalatedOrderId,
        sender: 'system',
        text: ' Dispute was escalated to the next arbitration level after appeal.',
        createdAt: Date.now()
      })
    }
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
      text: ' Dispute cancelled. Escrow protection was stopped by user action.',
      createdAt: Date.now()
    })
  }

  const sendOrderMessage = (
    orderId: string,
    sender: 'buyer' | 'seller' | 'arb',
    text: string,
    arbAlias?: string,
    imageUrl?: string
  ) => {
    const message = text.trim()
    if (!message && !imageUrl) return

    appendChatMessage({
      id: uid('chat'),
      orderId,
      sender,
      text: message || 'Image attached',
      createdAt: Date.now(),
      arbAlias: sender === 'arb' ? (arbAlias?.trim() || 'Arbitrator') : undefined,
      imageUrl
    })
  }

  const joinDisputeChat = (disputeId: string, arbAlias: string) => {
    const target = disputes.find((item) => item.id === disputeId)
    if (!target) return

    const alias = arbAlias.trim() || 'Arbitrator'

    const joinEventText = ` Arbitrator ${alias} joined the dispute chat.`
    const alreadyJoined = chatMessages.some(
      (item) => item.orderId === target.orderId && item.sender === 'system' && item.text === joinEventText
    )

    if (!alreadyJoined) {
      appendChatMessage({
        id: uid('chat'),
        orderId: target.orderId,
        sender: 'system',
        text: joinEventText,
        createdAt: Date.now()
      })
    }

    setDisputes((prev) => {
      const next = prev.map((item) => (item.id === disputeId ? { ...item, arbitratorAlias: item.arbitratorAlias || alias } : item))
      db.setDisputes(next)
      return next
    })
  }

  const declineAssignedCase = (
    disputeId: string,
    reasonText: string,
    reasonType: 'unjustified' | 'lack_expertise'
  ): { ok: boolean; message: string } => {
    const reason = reasonText.trim()
    const workerKey = `${user.id}:${user.username}`
    const now = Date.now()

    if (['senior_arb', 'admin'].includes(user.role)) {
      return { ok: false, message: 'Senior arbitrators cannot decline assigned disputes.' }
    }

    if ((user.arbSuspendedUntil ?? 0) > now) {
      return { ok: false, message: 'You are suspended and cannot process disputes now.' }
    }

    if ((user.arbDeclineCooldownUntil ?? 0) > now) {
      return { ok: false, message: 'Cooldown active for declines. Please wait before taking further actions.' }
    }

    if (reason.length < 30) {
      return { ok: false, message: 'Please provide a detailed reason (at least 30 characters).' }
    }

    const target = disputes.find((item) => item.id === disputeId)
    if (!target) {
      return { ok: false, message: 'Dispute not found.' }
    }

    const assignedMatches = target.assignedTo === workerKey || target.assignedTo === String(user.id)
    if (!assignedMatches) {
      return { ok: false, message: 'This dispute is not assigned to you.' }
    }

    let warningIncrement = 0
    let freeDeclineUsed = user.arbFreeDeclineUsed ?? false

    if (reasonType === 'lack_expertise') {
      warningIncrement = 0.5
    } else if (freeDeclineUsed) {
      warningIncrement = 1
    } else {
      freeDeclineUsed = true
    }

    const nextWarnings = (user.arbWarnings ?? 0) + warningIncrement
    const suspendedUntil = nextWarnings >= 3 ? now + 30 * 24 * 60 * 60 * 1000 : user.arbSuspendedUntil
    const cooldownUntil = now + 30 * 60 * 1000

    const fallbackStatus: DisputeStatus =
      target.status === 'assigned_trainee'
        ? 'opened'
        : target.status === 'escalated_to_senior'
          ? 'escalated_to_senior'
          : 'escalated_to_arb'
    const nextDisputes = disputes.map((item) =>
      item.id === disputeId
        ? {
            ...item,
            assignedTo: undefined,
            status: fallbackStatus
          }
        : item
    )

    setDisputes(nextDisputes)
    db.setDisputes(nextDisputes)

    const nextUser: User = {
      ...user,
      arbWarnings: nextWarnings,
      arbDeclinesCount: (user.arbDeclinesCount ?? 0) + 1,
      arbFreeDeclineUsed: freeDeclineUsed,
      arbDeclineCooldownUntil: cooldownUntil,
      arbSuspendedUntil: suspendedUntil
    }
    setUser(nextUser)

    appendChatMessage({
      id: uid('chat'),
      orderId: target.orderId,
      sender: 'system',
      text: ` Arbitrator declined dispute ${target.id}. Reason: ${reason}`,
      createdAt: now
    })

    if (warningIncrement > 0) {
      appendChatMessage({
        id: uid('chat'),
        orderId: target.orderId,
        sender: 'system',
        text: ` Arbitrator warning issued (+${warningIncrement}). Total warnings: ${nextWarnings}.`,
        createdAt: now
      })
    }

    return {
      ok: true,
      message: suspendedUntil && suspendedUntil > now
        ? 'Dispute declined. You reached 3 warnings and are suspended for 30 days.'
        : 'Dispute declined successfully. 30-minute cooldown has been applied.'
    }
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
      sendOrderMessage,
      joinDisputeChat,
      declineAssignedCase
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
