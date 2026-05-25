import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserBookings } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function MyBookings() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getUserBookings(user.uid)
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [user])

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
            {bookings.map(b => (
              <div key={b.id} className="booking-card">
                <div className="booking-header">
                  <span className="booking-id">{b.bookingId}</span>
                  <span className={`badge ${b.payment?.status==='paid'||b.status==='confirmed' ? 'badge-green' : 'badge-stone'}`}>
                    {b.payment?.status==='paid'||b.status==='confirmed' ? '✓ Confirmed' : b.status||'Pending'}
                  </span>
                </div>
                <h3 className="booking-tour-name">{b.tourTitle || b.tour?.title}</h3>
                <p className="booking-route">📍 {b.origin || b.tour?.origin} → {b.destination || b.tour?.destination}</p>
                <div className="booking-meta">
                  <span>💺 Seats: {b.selectedSeats?.join(', ')}</span>
                  <span>👥 {b.passengers?.length} passenger{b.passengers?.length!==1?'s':''}</span>
                </div>
                {b.pricing?.totalAmount > 0 && (
                  <div className="booking-footer">
                    <span>Total Paid</span>
                    <span className="booking-amount">₹{b.pricing.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
