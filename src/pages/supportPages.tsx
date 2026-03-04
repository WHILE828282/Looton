import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'

const FAQ_SECTIONS = [
  '📜 Looton Platform Rules',
  '⚠️ Confirmation popup before completing an order',
  '⚠️ Warning popup before canceling a dispute',
  '📜 Terms of Service (legal-style)',
  '📜 Seller Agreement',
  '📜 Arbitration Rules'
] as const

const getFaqSectionContent = (section: (typeof FAQ_SECTIONS)[number]) => {
  const content: Record<(typeof FAQ_SECTIONS)[number], string> = {
  '📜 Looton Platform Rules': LOOTON_PLATFORM_RULES,
  '⚠️ Confirmation popup before completing an order': `Title: Confirm Order Completion

Body:
You are about to mark this order as Completed.

If you confirm:

Escrow protection ends immediately.

Payment is released to the seller.

You may lose the ability to dispute this order.

✅ Confirm ONLY if you have:

received the item/service in full,

verified access/ownership (accounts/keys/subscriptions),

checked that everything matches the listing.

❌ Do NOT confirm if:

delivery is pending,

the item is incorrect/partial,

you were asked to confirm “in advance”.

If something is wrong, open a Dispute and wait for arbitration.

Buttons: Cancel / Confirm`,
  '⚠️ Warning popup before canceling a dispute': `Title: Cancel Dispute

Body:
Canceling a dispute is a serious action.

If you cancel:

the case is closed,

arbitration stops,

escrow may be released according to the current order state,

reopening may be impossible.

❌ If the order is not fully delivered, DO NOT cancel.
Wait for the assigned arbitrator and provide evidence.

Buttons: Keep Dispute / Cancel Dispute`,
  '📜 Terms of Service (legal-style)': `📜 Looton Terms of Service (Short, Dense)
1) Platform Role

Looton is a marketplace infrastructure (Telegram Mini App) providing listings, escrow, payouts, and dispute resolution. Looton is not the seller and does not guarantee the quality, legality, or availability of user-listed goods.

2) Eligibility & Accounts

Users must use Looton lawfully and keep account access secure. You are responsible for actions under your account. Looton may restrict accounts for risk, abuse, fraud signals, or rule violations.

3) Payments & Escrow

All orders must be paid through Looton escrow (TON). Off-platform payments and contact-sharing to bypass escrow are prohibited. Funds stay locked until completion or a dispute decision.

4) Order Completion

Buyer confirmation is the final step that triggers release of funds. Confirm only after full verification. “Confirm first” requests by sellers are prohibited.

5) Disputes & Evidence

If a problem occurs, open a dispute before confirming completion. Both parties must cooperate and provide evidence when requested. Non-cooperation may lead to a decision against the non-cooperating party.

6) Fees

Looton charges a commission and may charge service fees (e.g., priority features, dispute fees, seller deposit features). Fees are disclosed in the interface and may be updated.

7) Prohibited Activity

Prohibited: fraud/scams, stolen/hacked goods, illegal content, personal data trading, malware, spam services, review manipulation, harassment, discrimination, threats, platform exploitation, and any attempt to move deals outside Looton.

8) Enforcement

Looton may issue warnings, limit features, suspend accounts, freeze funds for investigation, cancel listings, or permanently ban accounts. Severe violations may lead to payout refusal and bans of linked accounts.

9) Changes

Looton may update rules and ToS. Continued use means acceptance of the latest version.`,
  '📜 Seller Agreement': `📜 Seller Agreement (Short, Dense)
1) Seller Duties

Sellers must deliver exactly what is listed: correct item/service, correct quantity, correct timeframe. Sellers must communicate reasonably and provide proof of delivery when asked.

2) Listing Standards

Listings must be accurate: correct category, clear description, real availability, fair pricing, no misleading claims. Duplicate/spam listings are prohibited.

3) No Early Confirmation

Sellers must not request completion confirmation before delivery. Violations may disable instant payouts and/or trigger sanctions.

4) Off-Platform Bypass Ban

Sellers must not share contacts, request direct payment, or offer discounts for off-platform deals. This is treated as an attempt to evade escrow and fees.

5) Dispute Cooperation

If a dispute is opened, sellers must respond, provide evidence, and follow arbitration instructions. Ignoring arbitration may result in refunds to the buyer.

6) Seller Deposit & Withdrawals

Looton may offer faster payouts for sellers with a maintained deposit. Withdrawing the deposit may revert payouts to standard timing and may trigger additional checks. Deposits may be used only according to published platform rules (e.g., risk control / dispute outcomes).

7) Sanctions

Looton may remove listings, restrict selling, disable instant payouts, hold withdrawals for review, or ban accounts for violations.`,
  '📜 Arbitration Rules': `⚖️ Arbitration Rules (Short, Dense, Your System)
1) Arbitration Levels

Looton uses 3 levels:

Level 1: Trainee Arbitrator — simple cases, first review.

Level 2: Arbitrator — complex cases, escalations.

Level 3: Senior Arbitrator — final decision.

Assignment is randomized; arbitrators do not pick cases.

2) When Disputes Can Be Opened

A dispute may be opened if:

non-delivery / delayed delivery,

wrong item / mismatch to listing,

partial fulfillment,

access revoked / key invalid / subscription not working,

evidence of fraud or manipulation.

Opening a dispute freezes the order and locks escrow until resolution.

3) Evidence Standards

Arbitration decisions are evidence-based. Valid evidence includes:

screenshots and screen recordings,

chat logs inside Looton,

transaction/hash proof (where applicable),

delivery confirmations, account access checks, key redemption checks,

time-stamped proof of work/delivery.

Submitting fake evidence is a severe violation.

4) Arbitrator Requests

Arbitrators may request specific actions:

provide missing proof,

clarify order terms,

verify access live or via recording,

confirm whether delivery occurred.

Ignoring requests or stalling may count against the ignoring party.

5) Possible Outcomes

Arbitration may decide:

Full refund to buyer,

Partial refund (partial delivery / partial mismatch),

Release payment to seller (successful delivery),

Split outcome based on evidence and delivered portion.

6) Appeals

If a party disagrees, they may appeal:

appeal escalates the case to a higher level,

a Senior Arbitrator decision is final.
Abusive appeals (spam) may be restricted.

7) Fees (Your Model)

A dispute may include an arbitration fee model:

if a party escalates a case to a higher level, the escalation fee applies,

the losing party pays arbitration fees (including escalation fees),

if the outcome changes on appeal, the “losing party” definition updates accordingly.

8) Arbitrator Quality Control

Arbitrators can receive warnings/suspension for repeated incorrect decisions or abuse. Trainees may be removed after multiple warnings. (Internal KYC may apply to arbitration roles.)

9) Final Authority

Looton may override decisions only in exceptional cases (platform safety, proven fraud rings, clear rule violations, technical faults), and may freeze funds during investigations.`
  }

  return content[section]
}

const LOOTON_PLATFORM_RULES = `📜 Looton Platform Rules

1. General Provisions

1.1. Looton is a digital goods marketplace inside Telegram where users can buy and sell game items, in-game currency, accounts, digital keys, subscriptions, Telegram gifts, and other digital products.

1.2. All transactions on Looton use escrow protection: the buyer’s funds are held by the system until the order is confirmed as completed.

1.3. By using Looton, you agree to these rules automatically.

1.4. Looton administration reserves the right to:

update or change these rules,

restrict access to the platform,

review and investigate accounts and orders,

temporarily hold withdrawals if suspicious activity is detected.

2. Core Platform Principles

Looton is built on:

transaction safety,

seller competition fairness,

buyer protection,

transparent dispute handling,

user anonymity.

Any behavior that undermines these principles may lead to penalties.

3. Rules for All Users

3.1. No Off-Platform Deals / No Contact Sharing

It is prohibited to:

share or request contact details,

move a deal outside Looton,

request direct payment outside escrow,

offer discounts in exchange for off-platform payment.

“Contact details” include:

Telegram usernames,

Discord IDs,

WhatsApp/VK/Instagram/email/phone numbers,

any external messenger or social profile.

Sanctions may include:

warning,

temporary suspension,

permanent ban,

payout restrictions.

3.2. Fraud and Deception

It is prohibited to:

sell non-existent goods/services,

mislead users intentionally,

use stolen accounts or stolen goods,

exploit platform vulnerabilities,

trick someone into confirming an order.

Sanctions may include:

permanent ban,

funds freeze,

ban of all linked accounts.

3.3. Review Manipulation

It is prohibited to:

buy/sell reviews,

inflate ratings artificially,

pressure users to change reviews,

post false reviews,

alter old reviews without a valid reason.

Sanctions may include:

review removal,

temporary suspension,

permanent ban for repeated behavior.

3.4. Spam and Advertising

It is prohibited to:

mass message users,

post unsolicited advertisements,

promote other marketplaces,

send unnecessary links.

Sanctions may include:

warning,

temporary or permanent suspension.

3.5. Communication Rules

It is prohibited to:

insult or harass users,

threaten others,

flood chats,

provoke conflict,

push political discussions,

send unwanted sexual content.

Sanctions may include:

warning,

temporary suspension,

permanent ban for repeated violations.

3.6. Sharing Private User Information

It is prohibited to disclose or distribute:

usernames/IDs,

order amounts,

private chat screenshots,

private order details,

especially when done to harm another user.

Sanctions may include:

permanent ban,

funds restrictions.

4. Seller Rules

4.1. Seller Responsibilities

Sellers must:

deliver the order within the agreed timeframe,

deliver the full quantity/value as described,

answer buyer questions related to the order,

cooperate during disputes and provide evidence when requested.

4.2. Prohibited Seller Behavior

Sellers must not:

ask buyers to confirm completion before delivery,

ignore buyer questions without reason,

publish fake listings or misleading pricing,

create duplicate listings to spam search,

list items in the wrong category to avoid competition or rules.

Sanctions may include:

listing removal,

temporary suspension,

permanent ban for repeated violations.

4.3. Fee Avoidance / Escrow Bypass

It is prohibited to:

request direct payment,

offer discounts for off-platform payments,

complete deals outside Looton escrow.

Sanctions may include:

permanent ban,

payout refusal in severe cases.

5. Prohibited Items & Categories

Looton prohibits selling:

stolen/hacked accounts,

unlawfully obtained goods,

personal data,

malware or harmful software,

fraud tutorials or scam tools,

spam services,

illegal content or anything violating applicable law.

Sanctions may include:

permanent ban,

funds restrictions,

additional verification requests.

6. Escrow Protection Rules

6.1. After payment, the buyer’s funds are held in escrow.

6.2. The seller receives funds only after the buyer confirms successful completion.

6.3. Buyers must confirm completion only after verifying delivery.

7. Disputes

If something goes wrong with an order:

a dispute may be opened,

the order becomes frozen,

escrow funds remain locked,

both parties must provide evidence,

an arbitrator reviews the case and issues a decision.

8. Looton Arbitration System

Looton uses a three-level arbitration model:

Level 1 — Trainee Arbitrator

Handles simple disputes and first reviews.

Level 2 — Arbitrator

Handles complex disputes and appeals.

Level 3 — Senior Arbitrator

Provides final decisions on escalated cases.

The decision of the Senior Arbitrator is final within platform rules.

9. Appeals

If a user disagrees with a decision:

they may submit an appeal,

the case may be escalated to a higher level,

the final decision will be made by a Senior Arbitrator.

Appeal abuse (spam appeals) may lead to restrictions.

10. Seller Liability & Refund Outcomes

If a seller:

fails to deliver,

delivers partially,

delivers an incorrect product/service,

violates listing terms,

the arbitration team may order:

full refund,

partial refund,

compensation for proven damage (when applicable).

11. Withdrawals & Seller Deposits

11.1. Standard withdrawal can take up to 24 hours.

11.2. Instant withdrawal may be available for sellers who maintain a permanent deposit (stake) on the platform.

11.3. If a seller withdraws their deposit, instant withdrawals may be temporarily disabled and the standard withdrawal window applies.

Looton may hold withdrawals if suspicious activity is detected.

12. Account Reviews & Checks

Looton may:

review suspicious activity,

restrict features temporarily,

request additional checks for arbitrators (KYC for arbitration roles),

take action to protect users and the platform.

13. Platform Role & Limitation

Looton is not the seller of goods. Looton provides:

escrow infrastructure,

dispute resolution mechanisms,

marketplace tools.

Users are responsible for listing accuracy and legal compliance.

14. Administration Rights

Looton administration may:

remove listings,

restrict accounts,

reverse actions when required for safety,

apply sanctions,

update rules at any time.`

export const ProfileSupportPage = () => (
  <div className="stack">
    <Card>
      <h3>Support center</h3>
      <p>Select what you need:</p>
      <div className="row">
        <strong>📝 Write a complaint</strong>
        <small>Open a complaint ticket ›</small>
      </div>
      <Link className="row" to="/disputes">
        <strong>⚖️ Disputes</strong>
        <small>Open disputes section ›</small>
      </Link>
      <div className="row">
        <strong>💬 Contact support</strong>
        <small>Start support chat ›</small>
      </div>
      <Link className="row" to="/profile/support/faq">
        <strong>❓ FAQ</strong>
        <small>Read common questions ›</small>
      </Link>
    </Card>
  </div>
)

export const ProfileSupportFaqPage = () => {
  const [activeSection, setActiveSection] = useState<(typeof FAQ_SECTIONS)[number] | null>(null)

  return (
    <div className="stack">
      <Card>
        <h3>FAQ</h3>
        <p>Available sections:</p>
        {FAQ_SECTIONS.map((section) => (
          <button
            key={section}
            className="row"
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 0, cursor: 'pointer' }}
            onClick={() => setActiveSection(section)}
          >
            <strong>{section}</strong>
            <small>{activeSection === section ? 'Opened' : 'Open section'}</small>
          </button>
        ))}
      </Card>

      {activeSection && (
        <Card>
          <h4>{activeSection}</h4>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{getFaqSectionContent(activeSection)}</pre>
        </Card>
      )}
    </div>
  )
}
