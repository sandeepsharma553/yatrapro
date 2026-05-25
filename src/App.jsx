import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import TourDetail from './pages/TourDetail'
import BookingFood from './pages/BookingFood'
import BookingPayment from './pages/BookingPayment'
import BookingConfirm from './pages/BookingConfirm'
import Login from './pages/Login'
import Register from './pages/Register'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"                  element={<Home />} />
          <Route path="/search"            element={<SearchResults />} />
          <Route path="/tours/:id"         element={<TourDetail />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />

          {/* Protected Routes */}
          <Route path="/booking/food"    element={<ProtectedRoute><BookingFood /></ProtectedRoute>} />
          <Route path="/booking/payment" element={<ProtectedRoute><BookingPayment /></ProtectedRoute>} />
          <Route path="/booking/confirm" element={<ProtectedRoute><BookingConfirm /></ProtectedRoute>} />
          <Route path="/my-bookings"     element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

          {/* Admin Route */}
          <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
