import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBooking, updateBookingPayment } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function BookingPayment() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const draft     = JSON.parse(sessionStorage.getItem('bookingDraft') || '{}')
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState({ name:'', email: user?.email||'', phone:'' })

  const handlePay = async () => {
    if (!contact.name || !contact.email || !contact.phone)
      return alert('Please fill in all contact details')
    setLoading(true)
    try {
      const bookingId = await createBooking({
        ...draft, userId: user.uid, userEmail: user.email,
        tourTitle: draft.tour?.title, origin: draft.tour?.origin,
        destination: draft.tour?.destination, contact,
      })
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
      if (razorpayKey && razorpayKey !== 'rzp_test_xxxxxxxx' && window.Razorpay) {
        const options = {
          key: razorpayKey,
          amount: (draft.pricing?.totalAmount || 0) * 100,
          currency: 'INR', name: 'YatraPro',
          description: draft.tour?.title,
          handler: async (response) => {
            await updateBookingPayment(bookingId, response)
            sessionStorage.setItem('bookingConfirmed', JSON.stringify({ ...draft, contact, bookingId }))
            navigate('/booking/confirm')
          },
          prefill: { name: contact.name, email: contact.email, contact: contact.phone },
          theme: { color: '#C4623A' }
        }
        new window.Razorpay(options).open()
      } else {
        // Demo mode
        await updateBookingPayment(bookingId, {
          razorpay_order_id: 'DEMO', razorpay_payment_id: 'DEMO_' + Date.now(), razorpay_signature: 'DEMO'
        })
        sessionStorage.setItem('bookingConfirmed', JSON.stringify({ ...draft, contact, bookingId }))
        navigate('/booking/confirm')
      }
    } catch (err) {
      alert('Booking failed: ' + err.message)
    } finally { setLoading(false) }
  }

  const { pricing, tour, selectedSeats, passengers } = draft

  return (
    <div className="page-pt pb-80">
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="container">
        <h1 className="page-title">Payment 💳</h1>
        <div className="payment-layout">
          <div>
            <div className="payment-card">
              <h3>Contact Details</h3>
              <div className="payment-fields">
                <div className="payment-field"><label>Full Name</label>
                  <input value={contact.name} onChange={e => setContact({...contact,name:e.target.value})} placeholder="Your full name" /></div>
                <div className="payment-field"><label>Email</label>
                  <input type="email" value={contact.email} onChange={e => setContact({...contact,email:e.target.value})} placeholder="you@example.com" /></div>
                <div className="payment-field"><label>Phone</label>
                  <input value={contact.phone} onChange={e => setContact({...contact,phone:e.target.value})} placeholder="98XXXXXXXX" /></div>
              </div>
            </div>
            <div className="payment-card" style={{ marginTop:16 }}>
              <h3>Booking Details</h3>
              <div className="detail-rows">
                <div className="detail-row"><span>Tour</span><strong>{tour?.title}</strong></div>
                <div className="detail-row"><span>Route</span><strong>{tour?.origin} → {tour?.destination}</strong></div>
                <div className="detail-row"><span>Duration</span><strong>{tour?.totalDays} days</strong></div>
                <div className="detail-row"><span>Seats</span><strong>{selectedSeats?.join(', ')}</strong></div>
                <div className="detail-row"><span>Passengers</span><strong>{passengers?.length}</strong></div>
              </div>
            </div>
          </div>
          <div className="bill-summary">
            <h3>Bill Summary</h3>
            <div className="bill-rows">
              <div className="bill-row"><span>Base Fare</span><span>₹{pricing?.baseFare?.toLocaleString('en-IN')}</span></div>
              {pricing?.foodCharges > 0 && <div className="bill-row"><span>Food</span><span>₹{pricing.foodCharges?.toLocaleString('en-IN')}</span></div>}
              <div className="bill-row"><span>GST (5%)</span><span>₹{pricing?.taxes?.toLocaleString('en-IN')}</span></div>
              <div className="bill-row bill-total"><span>Total</span><span>₹{pricing?.totalAmount?.toLocaleString('en-IN')}</span></div>
            </div>
            <button className="pay-btn" onClick={handlePay} disabled={loading}>
              {loading ? 'Processing...' : `Pay ₹${pricing?.totalAmount?.toLocaleString('en-IN')}`}
            </button>
            <p className="secure-payment-note">🔒 Razorpay secure · UPI, Card, NetBanking</p>
          </div>
        </div>
      </div>
    </div>
  )
}
