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
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div className="stack">
      <Card>
        <h3>FAQ</h3>
        <p>Available sections:</p>
        {FAQ_SECTIONS.map((section, index) => (
          <button
            key={section}
            className="row"
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 0, cursor: 'pointer' }}
            onClick={() => setActiveSection(section)}
          >
            <strong>{section}</strong>
            <small>{index === 0 ? 'Available now' : 'Coming next'}</small>
          </button>
        ))}
      </Card>

      {activeSection === '📜 Looton Platform Rules' && (
        <Card>
          <h4>📜 Looton Platform Rules</h4>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{LOOTON_PLATFORM_RULES}</pre>
        </Card>
      )}

      {activeSection && activeSection !== '📜 Looton Platform Rules' && (
        <Card>
          <h4>{activeSection}</h4>
          <p>This section will be added next.</p>
        </Card>
      )}
    </div>
  )
}
