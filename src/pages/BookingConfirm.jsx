import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function BookingConfirm() {
  const navigate  = useNavigate()
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    const data = sessionStorage.getItem('bookingConfirmed')
    if (data) {
      setBooking(JSON.parse(data))
      sessionStorage.removeItem('bookingConfirmed')
      sessionStorage.removeItem('bookingDraft')
    } else navigate('/')
  }, [])

  if (!booking) return null

  return (
    <div className="confirm-page page-pt">
      <div className="confirm-card">
        <div className="confirm-checkmark">✓</div>
        <h1 className="confirm-title">Booking Confirmed!</h1>
        <p className="confirm-sub">Your ticket has been saved. Check My Bookings anytime.</p>
        <div className="confirm-details">
          <div className="confirm-row"><span>Booking ID</span><strong>{booking.bookingId}</strong></div>
          <div className="confirm-row"><span>Tour</span><strong>{booking.tour?.title}</strong></div>
          <div className="confirm-row"><span>Route</span><strong>{booking.tour?.origin} → {booking.tour?.destination}</strong></div>
          <div className="confirm-row"><span>Duration</span><strong>{booking.tour?.totalDays} days</strong></div>
          <div className="confirm-row"><span>Seats</span><strong>{booking.selectedSeats?.join(', ')}</strong></div>
          <div className="confirm-row"><span>Passengers</span><strong>{booking.passengers?.length}</strong></div>
          <div className="confirm-row"><span>Total Paid</span><strong style={{ color:'#C4623A' }}>₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</strong></div>
        </div>
        <div className="confirm-actions">
          <Link to="/my-bookings" className="confirm-view-btn">View My Bookings</Link>
          <Link to="/"            className="confirm-home-btn">Go to Home</Link>
        </div>
      </div>
    </div>
  )
}
