import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTourById } from '../firebase/firestore'
import SeatMap from '../components/SeatMap'
import { useAuth } from '../context/AuthContext'

export default function TourDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tour, setTour]                   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [passengers, setPassengers]       = useState([])
  const [tab, setTab]                     = useState('info')

  useEffect(() => {
    setLoading(true)
    getTourById(id)
      .then(data => { if (!data) setError('Tour not found'); else setTour(data) })
      .catch(() => setError('Failed to load tour.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    setPassengers(selectedSeats.map((seat, i) =>
      passengers[i] || { name: '', age: '', gender: 'male', seatNumber: seat }
    ))
  }, [selectedSeats])

  const handlePassengerChange = (index, field, value) => {
    setPassengers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value, seatNumber: selectedSeats[index] }
      return updated
    })
  }

  const totalAmount = () => {
    if (!tour) return 0
    const base = tour.pricePerPerson * selectedSeats.length
    return base + Math.round(base * 0.05)
  }

  const handleProceed = () => {
    if (!user) return navigate('/login')
    if (selectedSeats.length === 0) return alert('Please select at least one seat')
    if (!passengers.every(p => p.name && p.age)) return alert('Please fill in all passenger details')
    sessionStorage.setItem('bookingDraft', JSON.stringify({
      tourId: tour.id, tour, selectedSeats, passengers,
      pricing: {
        baseFare:    tour.pricePerPerson * selectedSeats.length,
        taxes:       Math.round(tour.pricePerPerson * selectedSeats.length * 0.05),
        totalAmount: totalAmount()
      }
    }))
    navigate('/booking/food')
  }

  if (loading) return <div className="page-pt"><div className="spinner" /></div>
  if (error)   return (
    <div className="page-pt" style={{ textAlign:'center', padding:'80px 24px' }}>
      <span style={{ fontSize:60 }}>😕</span>
      <h2 style={{ margin:'16px 0 8px' }}>{error}</h2>
      <button className="btn-primary" onClick={() => navigate('/search')}>Browse Tours</button>
    </div>
  )

  const busType = tour.bus?.type || tour.busType

  return (
    <div className="page-pt pb-80">
      {/* Hero */}
      <div className="detail-hero">
        <div className="container">
          <p className="detail-breadcrumb" onClick={() => navigate(-1)}>← Go Back</p>
          <h1 className="detail-title">{tour.title}</h1>
          <div className="detail-badges">
            <span className="badge badge-terra">🚌 {busType}</span>
            <span className="badge badge-stone">📅 {tour.totalDays} Days</span>
            <span className="badge badge-green">💺 {(tour.availableSeats||0) - selectedSeats.length} Seats Left</span>
          </div>
          <p className="detail-route">📍 {tour.origin} → {tour.destination}</p>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">
          {/* Main */}
          <div>
            <div className="detail-tabs">
              {['info','seats','stops'].map(t => (
                <button key={t} className={`detail-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
                  {{ info:'Tour Info', seats:'Select Seats', stops:'Itinerary' }[t]}
                </button>
              ))}
            </div>

            {tab === 'info' && (
              <div className="detail-tab-content">
                <div className="info-grid">
                  {tour.bus?.amenities?.length > 0 && (
                    <div className="info-box">
                      <h3>Bus Amenities</h3>
                      <div className="amenities-row">
                        {tour.bus.amenities.map(a => <span key={a} className="tag">{a}</span>)}
                      </div>
                    </div>
                  )}
                  {tour.includedMeals?.length > 0 && (
                    <div className="info-box">
                      <h3>Meals Included</h3>
                      <div className="amenities-row">
                        {tour.includedMeals.map(m => <span key={m} className="tag">🍽️ {m}</span>)}
                      </div>
                    </div>
                  )}
                  {(tour.startDate || tour.endDate) && (
                    <div className="info-box">
                      <h3>Travel Dates</h3>
                      <p style={{ fontSize:14, color:'#7A6E68' }}>{tour.startDate} → {tour.endDate}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'seats' && (
              <div className="detail-tab-content">
                <SeatMap
                  busType={busType || 'sleeper'}
                  totalSeats={tour.bus?.totalSeats || tour.totalSeats || 40}
                  bookedSeats={tour.bookedSeats || []}
                  selectedSeats={selectedSeats}
                  onSelect={setSelectedSeats}
                />
                {selectedSeats.length > 0 && (
                  <div className="passenger-forms">
                    <h3 className="passenger-title">Passenger Details</h3>
                    {passengers.map((p, i) => (
                      <div key={selectedSeats[i]} className="passenger-row">
                        <div className="seat-label">Seat {selectedSeats[i]}</div>
                        <input className="p-input" placeholder="Full name" value={p.name}
                          onChange={e => handlePassengerChange(i, 'name', e.target.value)} />
                        <input className="p-input-sm" type="number" placeholder="Age" value={p.age}
                          onChange={e => handlePassengerChange(i, 'age', e.target.value)} min="1" max="100" />
                        <select className="p-select" value={p.gender}
                          onChange={e => handlePassengerChange(i, 'gender', e.target.value)}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'stops' && (
              <div className="detail-tab-content">
                {tour.stops?.length > 0 ? tour.stops.map((stop, i) => (
                  <div key={i} className="stop-row">
                    <div className="stop-dot" />
                    <div>
                      <div className="stop-place">{stop.place}</div>
                      <div className="stop-time">Day {stop.day} · Arrival at {stop.arrivalTime}</div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign:'center', padding:'40px', color:'#7A6E68' }}>
                    No itinerary added yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="summary-card">
            <h3 className="summary-title">Booking Summary</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Selected Seats</span>
                <span className="summary-val">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}</span>
              </div>
              <div className="summary-row">
                <span>Rate</span>
                <span className="summary-val">₹{tour.pricePerPerson?.toLocaleString('en-IN')} × {selectedSeats.length}</span>
              </div>
              <div className="summary-row">
                <span>GST (5%)</span>
                <span className="summary-val">₹{Math.round(tour.pricePerPerson * selectedSeats.length * 0.05).toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span className="summary-total-val">₹{totalAmount().toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button className="proceed-btn"
              onClick={selectedSeats.length > 0 ? handleProceed : () => setTab('seats')}>
              {selectedSeats.length > 0 ? 'Proceed →' : 'Select Seats'}
            </button>
            <p className="secure-note">🔒 100% Secure Payment</p>
          </div>
        </div>
      </div>
    </div>
  )
}
