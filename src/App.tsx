import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import {
  ChatPage,
  CheckoutPage,
  DepositPage,
  DisputeDetailsPage,
  DisputesPage,
  GamePage,
  HomePage,
  MessagesPage,
  OfferDetailsPage,
  OffersPage,
  OrderDetailsPage,
  OrdersPage,
  ProfilePage,
  ProfileSupportPage,
  RoleGate,
  SellNewPage,
  SellPage,
  StaffCasePage,
  StaffKycPage,
  StaffPage,
  StaffQueuePage
} from './pages/pages'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/game/:gameId/offers/:category" element={<OffersPage />} />
        <Route path="/offer/:offerId" element={<OfferDetailsPage />} />
        <Route path="/checkout/:offerId" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/chats" element={<MessagesPage />} />
        <Route path="/order/:orderId" element={<OrderDetailsPage />} />
        <Route path="/order/:orderId/chat" element={<ChatPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/sell/new" element={<SellNewPage />} />
        <Route path="/disputes" element={<DisputesPage />} />
        <Route path="/dispute/:disputeId" element={<DisputeDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/support" element={<ProfileSupportPage />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/staff" element={<RoleGate><StaffPage /></RoleGate>} />
        <Route path="/staff/queue" element={<RoleGate><StaffQueuePage /></RoleGate>} />
        <Route path="/staff/case/:disputeId" element={<RoleGate><StaffCasePage /></RoleGate>} />
        <Route path="/staff/kyc" element={<RoleGate><StaffKycPage /></RoleGate>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  )
}
