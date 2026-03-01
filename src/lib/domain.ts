import { DEPOSIT_THRESHOLD } from './mockData'
import type { Order, Offer, User } from '../types'

export const PLATFORM_FEE_RATE = 0.05
export const HOLD_HOURS = 24

export const calcFee = (amountTon: number) => Number((amountTon * PLATFORM_FEE_RATE).toFixed(2))

export const isInstantEligible = (user: User) => user.depositStatus === 'active' && user.depositTon >= DEPOSIT_THRESHOLD

export const payoutBadge = (offer: Offer) => {
  if (offer.deliveryType === 'instant') return 'Instant'
  return offer.payoutPolicy === 'instant_if_deposit' ? 'Instant if deposit' : '24h hold'
}

export const canOpenDispute = (order: Order) => Date.now() <= order.timers.confirmUntil

export const isCompletedStatus = (status: Order['status']) =>
  ['confirmed', 'auto_confirmed', 'resolved_buyer', 'resolved_seller', 'cancelled'].includes(status)
