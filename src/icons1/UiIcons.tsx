import type { ReactElement } from 'react'

const IconBase = ({ children }: { children: ReactElement | ReactElement[] }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)

export const ArrowLeftIcon = () => <IconBase><path d="m15 18-6-6 6-6" /><path d="M21 12H9" /></IconBase>
export const SearchIcon = () => <IconBase><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></IconBase>
export const MoonIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3a7.5 7.5 0 1 0 9 9A9 9 0 1 1 12 3" /></svg>
export const EllipsisVerticalIcon = () => <IconBase><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></IconBase>
export const SendIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
export const SendArrowIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 15.2V8.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <path d="M8.9 11.9L12 8.8L15.1 11.9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const AttachmentIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21.44 11.05 12.25 20.24a6.25 6.25 0 0 1-8.84-8.84L13.3 1.51a4.18 4.18 0 1 1 5.9 5.9l-9.54 9.54a2.08 2.08 0 1 1-2.94-2.94l8.83-8.83" /></svg>
export const ReportIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4v16" /><path d="M4 5h11l-2.2 4L15 13H4" /></svg>
export const BlockIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M8.5 15.5 15.5 8.5" /></svg>
export const UnblockIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="m8.2 12.5 2.6 2.6 5-5" /></svg>
export const ShieldIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3 5 6v6c0 4.3 2.8 7.8 7 9 4.2-1.2 7-4.7 7-9V6l-7-3Z" /><path d="m9.2 12 1.9 1.9 3.8-3.8" /></svg>
export const CheckIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m20 6-11 11-5-5" /></svg>
export const CheckDoubleIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m18 7-8 8-4-4" /><path d="m22 7-8 8" /></svg>

export const MarketIcon = () => <IconBase><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></IconBase>
export const OrdersIcon = () => <IconBase><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></IconBase>
export const SellIcon = () => <IconBase><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></IconBase>
export const DisputesIcon = () => <IconBase><path d="m16 16 3 3 3-3"/><path d="M19 13v6"/><path d="M5 8h14"/><path d="M7 8c0-1.7.7-3 2-4"/><path d="M17 8c0-1.7-.7-3-2-4"/><path d="M9 8v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8"/></IconBase>
export const QueueIcon = () => <IconBase><circle cx="12" cy="12" r="10"/><path d="m12 6 4 6-4 6-4-6 4-6z"/></IconBase>
export const ChatsIcon = () => <IconBase><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></IconBase>
export const ProfileIcon = () => <IconBase><circle cx="12" cy="8" r="4"/><path d="M6 20a6 6 0 0 1 12 0"/></IconBase>

export const StarIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

export const GlobeIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
export const WalletIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/><path d="M16 12h5"/><circle cx="16" cy="12" r="1"/></svg>
export const ClockIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
export const ThemeIcon = ({ className }: { className?: string }) => <MoonIcon />
export const SettingsIcon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h0A1.6 1.6 0 0 0 10 3.2V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.5h0a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z"/></svg>

export const TonIcon = ({ className }: { className?: string }) => <svg className={className} width="64" height="64" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden><circle cx="28" cy="28" r="28" fill="#0098EA"/><path d="M37.886 15H18.114C14.486 15 12.184 18.92 13.974 22.012L26.15 43.044C26.94 44.408 29.06 44.408 29.85 43.044L42.026 22.012C43.816 18.92 41.514 15 37.886 15ZM25.31 36.736L22.658 31.6L16.258 19.966C15.836 19.198 16.386 18.25 17.254 18.25H25.31V36.736ZM39.742 19.966L33.342 31.614L30.69 36.736V18.25H38.746C39.614 18.25 40.164 19.198 39.742 19.966Z" fill="white"/></svg>
