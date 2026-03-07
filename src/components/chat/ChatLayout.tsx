import { type ChangeEvent, type RefObject } from 'react'
import { AttachmentIcon, BlockIcon, CheckDoubleIcon, CheckIcon, ClockIcon, EllipsisVerticalIcon, ReportIcon, SendArrowIcon, ShieldIcon, TonIcon, UnblockIcon, WalletIcon } from '../../icons1/UiIcons'
import type { ChatMessage } from '../../types'

export type ReportReason = 'not_completed' | 'no_response' | 'wrong_item' | 'fraud' | 'order_issue' | 'abuse' | 'other'

export type ChatThread = {
  order: { id: string; buyerId: number; sellerId: number }
  offer?: { description: string }
  dispute?: { arbitratorAlias?: string; status?: string }
  peerId: number
  title: string
  peer: string
  preview: string
  time: string
  unreadCount: number
  orderStatus: string
  hasDispute: boolean
}

type HeaderProps = {
  peer: string
  isBlocked: boolean
  menuOpen: boolean
  detailsOpen: () => void
  menuRef: RefObject<HTMLDivElement>
  onToggleMenu: () => void
  onReport: () => void
  onToggleBlock: () => void
}

type ReportModalProps = {
  reportOpen: boolean
  reportReason: ReportReason
  reportReasons: Array<{ value: ReportReason; label: string }>
  reportOtherReason: string
  reportDetails: string
  reportAttachment?: string
  reportFileRef: RefObject<HTMLInputElement>
  onClose: () => void
  onReasonChange: (reason: ReportReason) => void
  onOtherReasonChange: (value: string) => void
  onDetailsChange: (value: string) => void
  onReportFile: (event: ChangeEvent<HTMLInputElement>) => void
  onOpenUpload: () => void
  onRemoveAttachment: () => void
  onSubmit: () => void
}

type DetailsDrawerProps = {
  open: boolean
  description: string
  onClose: () => void
}

export const ChatHeader = ({ peer, isBlocked, menuOpen, detailsOpen, menuRef, onToggleMenu, onReport, onToggleBlock }: HeaderProps) => (
  <header className="messages-chat-head">
    <div>
      <strong>{peer}</strong>
      <small>{isBlocked ? 'Blocked' : 'Online'}</small>
    </div>
    <div className="messages-head-actions" ref={menuRef}>
      <button className="icon-btn" type="button" aria-label="Chat actions" onClick={onToggleMenu}><EllipsisVerticalIcon /></button>
      <button className="btn details-toggle-btn" type="button" onClick={detailsOpen}>Details</button>
      {menuOpen && (
        <div className="messages-menu card" role="menu" aria-label="Chat actions menu">
          <button type="button" className="messages-menu-item" onClick={onReport}>
            <ReportIcon />
            <span>Report</span>
          </button>
          <button type="button" className="messages-menu-item" onClick={onToggleBlock}>
            {isBlocked ? <UnblockIcon /> : <BlockIcon />}
            <span>{isBlocked ? 'Unblock user' : 'Block user'}</span>
          </button>
        </div>
      )}
    </div>
  </header>
)

const systemTypeLabel = (systemType: string) => {
  if (systemType === 'payment') return 'Payment secured'
  if (systemType === 'joined') return 'Arbitrator joined'
  if (systemType === 'dispute-assigned') return 'Dispute assigned'
  if (systemType === 'dispute-opened') return 'Dispute opened'
  if (systemType === 'dispute-update') return 'Dispute update'
  if (systemType === 'payment-confirmed') return 'Payment confirmed'
  if (systemType === 'confirmed') return 'Order completed'
  return 'System update'
}

const SystemMessageIcon = ({ systemType }: { systemType: string }) => {
  if (systemType === 'payment') return <TonIcon className="messages-system-type-icon" />
  if (systemType === 'payment-confirmed') return <CheckDoubleIcon />
  if (systemType === 'joined') return <WalletIcon />
  if (systemType === 'dispute-assigned') return <ShieldIcon />
  if (systemType === 'dispute-opened' || systemType === 'dispute-update') return <ReportIcon />
  if (systemType === 'confirmed') return <CheckDoubleIcon />
  return <ClockIcon />
}

export const SystemMessage = ({ message, systemType }: { message: ChatMessage; systemType: string }) => (
  <div className="messages-bubble-wrap system-wrap">
    <div className={`messages-timeline-card system-${systemType}`}>
      <span className="messages-system-icon"><SystemMessageIcon systemType={systemType} /></span>
      <div className="messages-system-content">
        <p className="messages-system-label">Transaction timeline · {systemTypeLabel(systemType)}</p>
        <p>{message.text}</p>
        <small>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
      </div>
    </div>
  </div>
)

export const MessageBubble = ({
  message,
  isMine,
  senderLabel
}: {
  message: ChatMessage
  isMine: boolean
  senderLabel: string
}) => {
  const ownState = isMine ? (Date.now() - message.createdAt > 120000 ? 'read' : 'delivered') : null

  return (
    <div className={`messages-bubble-wrap ${isMine ? 'mine' : ''}`}>
      {!isMine && <p className="messages-sender-name">{senderLabel}</p>}
      <div className={`messages-bubble ${message.sender}`}>
        <p>{message.text}</p>
        <small>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {ownState === 'delivered' && <CheckIcon className="msg-state-icon" />}
          {ownState === 'read' && <CheckDoubleIcon className="msg-state-icon" />}
        </small>
      </div>
    </div>
  )
}

type MessagesViewportProps = {
  messages: ChatMessage[]
  sender: ChatMessage['sender']
  senderLabel: (message: ChatMessage) => string
  getSystemType: (text: string) => string
  trimSystemPrefix: (value: string) => string
}

export const MessagesViewport = ({ messages, sender, senderLabel, getSystemType, trimSystemPrefix }: MessagesViewportProps) => (
  <div className="messages-chat-scroll">
    <div className="messages-list-viewport">
      {messages.length ? messages.map((message) => {
        if (message.sender === 'system') {
          const text = trimSystemPrefix(message.text)
          return <SystemMessage key={message.id} message={{ ...message, text }} systemType={getSystemType(text)} />
        }

        return <MessageBubble key={message.id} message={message} isMine={message.sender === sender} senderLabel={senderLabel(message)} />
      }) : <div className="messages-empty-pill">No messages in this chat yet.</div>}
    </div>
  </div>
)

type ComposerOverlayProps = {
  composerFileRef: RefObject<HTMLInputElement>
  draft: string
  attachedImage?: string
  isBlocked: boolean
  isArbitrator: boolean
  canSend: boolean
  onDraftChange: (value: string) => void
  onDraftInput: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onComposerFile: (event: ChangeEvent<HTMLInputElement>) => void
  onOpenComposerFile: () => void
  onRemoveAttachment: () => void
  onSend: () => void
}

export const ComposerOverlay = ({ composerFileRef, draft, attachedImage, isBlocked, isArbitrator, canSend, onDraftChange, onDraftInput, onComposerFile, onOpenComposerFile, onRemoveAttachment, onSend }: ComposerOverlayProps) => (
  <div className="messages-composer-overlay">
    <div className="messages-composer">
      <input ref={composerFileRef} className="file-input" type="file" accept="image/*" onChange={onComposerFile} />
      <button className="icon-btn" type="button" aria-label="Attach file" onClick={onOpenComposerFile}><AttachmentIcon /></button>
      <div className="messages-compose-input-wrap">
        <textarea
          className="input messages-compose-input"
          placeholder={isBlocked ? 'Unblock user to continue messaging...' : 'Write a message...'}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onInput={onDraftInput}
          rows={1}
          disabled={isBlocked && !isArbitrator}
        />
        {attachedImage && (
          <div className="messages-attachment-row">
            <small className="attach-hint">Attachment ready</small>
            <button className="messages-link-btn" type="button" onClick={onRemoveAttachment}>Remove</button>
          </div>
        )}
      </div>
      <button className="icon-btn send-btn" type="button" aria-label="Send" disabled={!canSend} onClick={onSend}><SendArrowIcon /></button>
    </div>
  </div>
)

type ActiveChatPanelProps = {
  messages: ChatMessage[]
  sender: ChatMessage['sender']
  senderLabel: (message: ChatMessage) => string
  getSystemType: (text: string) => string
  trimSystemPrefix: (value: string) => string
  headerProps: HeaderProps
  composerProps: ComposerOverlayProps
}

const ActiveChatPanel = ({ messages, sender, senderLabel, getSystemType, trimSystemPrefix, headerProps, composerProps }: ActiveChatPanelProps) => (
  <section className="messages-chat card" aria-label="Chat panel">
    <div className="messages-chat-grid">
      <article className="messages-chat-main">
        <ChatHeader {...headerProps} />
        <div className="messages-chat-body">
          <MessagesViewport
            messages={messages}
            sender={sender}
            senderLabel={senderLabel}
            getSystemType={getSystemType}
            trimSystemPrefix={trimSystemPrefix}
          />
          <ComposerOverlay {...composerProps} />
        </div>
      </article>
    </div>
  </section>
)

type ConversationsColumnProps = {
  threads: ChatThread[]
  selectedOrderId: string | null
  onSelectThread: (orderId: string) => void
}

const ConversationsColumn = ({ threads, selectedOrderId, onSelectThread }: ConversationsColumnProps) => (
  <aside className="messages-list card" aria-label="Conversation list">
    <div className="messages-list-head">
      <div>
        <strong>Chats workspace</strong>
        <small>Escrow conversations & disputes</small>
      </div>
      <small>{threads.length} active</small>
    </div>

    <div className="messages-list-scroll">
      <div className="messages-list-stack">
        {threads.length ? threads.map((thread) => {
          const isActive = thread.order.id === selectedOrderId
          return (
            <button
              key={thread.order.id}
              type="button"
              className={`messages-thread ${isActive ? 'active' : ''}`}
              onClick={() => onSelectThread(thread.order.id)}
            >
              <div className="messages-thread-avatar">{thread.peer.slice(0, 1).toUpperCase()}<span className="online-dot" /></div>
              <div className="messages-thread-main">
                <div className="messages-thread-head">
                  <strong className="messages-thread-peer">{thread.peer}</strong>
                  <div className="messages-thread-side">
                    <small className="messages-thread-time">{thread.time}</small>
                    {thread.unreadCount > 0 && <span className="messages-unread">{thread.unreadCount}</span>}
                  </div>
                </div>
                <p className="messages-thread-preview">{thread.preview}</p>
                <div className="messages-thread-foot">
                  <small className="messages-thread-title">{thread.title}</small>
                  <span className={`messages-thread-status ${thread.hasDispute ? 'dispute' : ''}`}>{thread.hasDispute ? 'Dispute' : thread.orderStatus.split('_').join(' ')}</span>
                </div>
              </div>
            </button>
          )
        }) : <p className="muted">No conversations yet.</p>}
      </div>
    </div>
  </aside>
)

export const ReportModal = ({ reportOpen, reportReason, reportReasons, reportOtherReason, reportDetails, reportAttachment, reportFileRef, onClose, onReasonChange, onOtherReasonChange, onDetailsChange, onReportFile, onOpenUpload, onRemoveAttachment, onSubmit }: ReportModalProps) => {
  if (!reportOpen) return null

  return (
    <div className="messages-details-modal messages-modal-centered" role="dialog" aria-modal="true" aria-label="Report user">
      <button className="messages-details-backdrop" type="button" aria-label="Close report" onClick={onClose} />
      <section className="messages-report card">
        <div className="messages-details-top">
          <h3>Report user</h3>
          <button className="icon-btn" type="button" aria-label="Close report" onClick={onClose}><EllipsisVerticalIcon /></button>
        </div>

        <label className="messages-details-label" htmlFor="report-reason">Report reason</label>
        <select id="report-reason" className="input" value={reportReason} onChange={(event) => onReasonChange(event.target.value as ReportReason)}>
          {reportReasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
        </select>

        {reportReason === 'other' && (
          <textarea className="input" rows={2} placeholder="Explain the issue" value={reportOtherReason} onChange={(event) => onOtherReasonChange(event.target.value)} />
        )}

        <label className="messages-details-label" htmlFor="report-description">Description</label>
        <textarea id="report-description" className="input" rows={4} placeholder="Describe the issue" value={reportDetails} onChange={(event) => onDetailsChange(event.target.value)} />

        <input ref={reportFileRef} className="file-input" type="file" accept="image/*" onChange={onReportFile} />
        <button className="btn secondary messages-report-attach" type="button" onClick={onOpenUpload}><AttachmentIcon /> Attach screenshot</button>
        {reportAttachment && (
          <div className="messages-attachment-row">
            <small className="attach-hint">Screenshot attached</small>
            <button className="messages-link-btn" type="button" onClick={onRemoveAttachment}>Remove</button>
          </div>
        )}

        <button className="btn" type="button" disabled={!reportDetails.trim() || (reportReason === 'other' && !reportOtherReason.trim())} onClick={onSubmit}>Submit report</button>
      </section>
    </div>
  )
}

export const DetailsDrawer = ({ open, description, onClose }: DetailsDrawerProps) => {
  if (!open) return null

  return (
    <div className="messages-details-modal" role="dialog" aria-modal="true" aria-label="Order details">
      <button className="messages-details-backdrop" type="button" aria-label="Close details" onClick={onClose} />
      <aside className="messages-details card">
        <div className="messages-details-top">
          <h3>Details</h3>
          <button className="icon-btn" type="button" aria-label="Close details" onClick={onClose}><EllipsisVerticalIcon /></button>
        </div>
        <p className="messages-details-label">Description</p>
        <div className="messages-details-description">{description}</div>
      </aside>
    </div>
  )
}

type ChatPageLayoutProps = {
  threads: ChatThread[]
  selectedOrderId: string | null
  onSelectThread: (orderId: string) => void
  selectedThread: ChatThread | null
  selectedMessages: ChatMessage[]
  sender: ChatMessage['sender']
  senderLabel: (message: ChatMessage) => string
  getSystemType: (text: string) => string
  trimSystemPrefix: (value: string) => string
  headerProps: HeaderProps
  composerProps: ComposerOverlayProps
}

export const ChatPageLayout = ({ threads, selectedOrderId, onSelectThread, selectedThread, selectedMessages, sender, senderLabel, getSystemType, trimSystemPrefix, headerProps, composerProps }: ChatPageLayoutProps) => (
  <section className="messages-shell">
    <ConversationsColumn threads={threads} selectedOrderId={selectedOrderId} onSelectThread={onSelectThread} />

    {!selectedThread ? (
      <section className="messages-chat card" aria-label="Chat panel">
        <div className="messages-empty-state">
          <p className="messages-empty-pill">Select a conversation to open your transaction workspace.</p>
          <small>You'll see order messages, dispute milestones and payout confirmations here.</small>
        </div>
      </section>
    ) : (
      <ActiveChatPanel
        messages={selectedMessages}
        sender={sender}
        senderLabel={senderLabel}
        getSystemType={getSystemType}
        trimSystemPrefix={trimSystemPrefix}
        headerProps={headerProps}
        composerProps={composerProps}
      />
    )}
  </section>
)
