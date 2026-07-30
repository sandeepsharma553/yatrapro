import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserBookings, cancelBooking } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function MyBookings() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [cancelling, setCancelling] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getUserBookings(user.uid)
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [user])

  const handleCancel = async (b) => {
    if (!confirm('Kya aap ye booking cancel karna chahte hain? Seats wapas free ho jayengi.')) return
    setCancelling(b.id)
    try {
      await cancelBooking(b)
      setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'cancelled' } : x))
    } catch (err) {
      alert('Cancel failed: ' + err.message)
    } finally { setCancelling('') }
  }

  const statusInfo = (b) => {
    if (b.status === 'cancelled') return { cls: 'badge-red',   label: '✕ Cancelled' }
    if (b.payment?.status === 'paid' || b.status === 'confirmed') return { cls: 'badge-green', label: '✓ Confirmed' }
    return { cls: 'badge-stone', label: b.status || 'Pending' }
  }

  return (
    <div className="page-pt pb-80">
      <div className="container">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-sub">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
        {loading ? <div className="spinner" /> : bookings.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎫</span>
            <h3>No bookings yet</h3>
            <p>Book your first trip and it will appear here!</p>
            <button className="btn-primary" onClick={() => navigate('/search')}>Explore Tours</button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(b => {
              const st = statusInfo(b)
              return (
                <div key={b.id} className={`booking-card ${b.status === 'cancelled' ? 'booking-cancelled' : ''}`}>
                  <div className="booking-header">
                    <span className="booking-id">{b.bookingId}</span>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                  </div>
                  <h3 className="booking-tour-name">{b.tourTitle || b.tour?.title}</h3>
                  <p className="booking-route">📍 {b.origin || b.tour?.origin} → {b.destination || b.tour?.destination}</p>
                  <div className="booking-meta">
                    <span>💺 Seats: {b.selectedSeats?.join(', ')}</span>
                    <span>👥 {b.passengers?.length} passenger{b.passengers?.length!==1?'s':''}</span>
                    {b.tour?.startDate && <span>📅 {b.tour.startDate}</span>}
                  </div>
                  {b.foodOrders?.length > 0 && (
                    <div className="booking-food">
                      🍛 {b.foodOrders.map(f => `${f.foodItem} × ${f.quantity}`).join(', ')}
                    </div>
                  )}
                  {b.pricing?.totalAmount > 0 && (
                    <div className="booking-footer">
                      <span>Total {b.payment?.status === 'paid' ? 'Paid' : 'Amount'}</span>
                      <span className="booking-amount">₹{b.pricing.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {b.status !== 'cancelled' && (
                    <div className="booking-actions">
                      <button className="btn-small btn-small-red"
                        disabled={cancelling === b.id}
                        onClick={() => handleCancel(b)}>
                        {cancelling === b.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
