import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllBookings, createTour, createBus, getTours } from '../firebase/firestore'

const TABS = ['Overview', 'Tours', 'Add Tour', 'Add Bus']

export default function AdminDashboard() {
  const { profile }     = useAuth()
  const [tab, setTab]   = useState('Overview')
  const [bookings, setBookings] = useState([])
  const [tours, setTours]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    Promise.all([getAllBookings(), getTours()])
      .then(([b, t]) => { setBookings(b); setTours(t) })
      .finally(() => setLoading(false))
  }, [])

  const revenue = bookings
    .filter(b => b.payment?.status === 'paid')
    .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0)

  return (
    <div className="page-pt pb-80">
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-sub">Welcome, {profile?.name}</p>

        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t} className={`admin-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-num">{bookings.length}</div><div className="stat-label">Total Bookings</div></div>
              <div className="stat-card"><div className="stat-num">{bookings.filter(b=>b.payment?.status==='paid').length}</div><div className="stat-label">Confirmed</div></div>
              <div className="stat-card"><div className="stat-num">{tours.length}</div><div className="stat-label">Active Tours</div></div>
              <div className="stat-card"><div className="stat-num">₹{revenue.toLocaleString('en-IN')}</div><div className="stat-label">Total Revenue</div></div>
            </div>
            <h3 className="section-head">Recent Bookings</h3>
            {loading ? <div className="spinner" /> : (
              <div className="admin-table">
                <div className="admin-table-head">
                  <span>Booking ID</span><span>Tour</span><span>Seats</span><span>Amount</span><span>Status</span>
                </div>
                {bookings.slice(0,10).map(b => (
                  <div key={b.id} className="admin-table-row">
                    <span className="booking-id">{b.bookingId}</span>
                    <span>{b.tourTitle || '—'}</span>
                    <span>{b.selectedSeats?.join(', ')}</span>
                    <span>₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                    <span><span className={`badge ${b.payment?.status==='paid'?'badge-green':'badge-terra'}`}>{b.payment?.status||'pending'}</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'Tours' && (
          <div>
            <h3 className="section-head">All Tours ({tours.length})</h3>
            <div className="admin-tour-list">
              {tours.map(t => (
                <div key={t.id} className="admin-tour-row">
                  <div>
                    <div className="admin-tour-name">{t.title}</div>
                    <div className="admin-tour-meta">{t.origin} → {t.destination} · {t.totalDays} days</div>
                  </div>
                  <div className="admin-tour-right">
                    <span>₹{t.pricePerPerson?.toLocaleString('en-IN')}/person</span>
                    <span className={`badge ${t.isActive?'badge-green':'badge-stone'}`}>{t.isActive?'Active':'Inactive'}</span>
                    <span>{t.availableSeats} seats left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Add Tour' && <AddTourForm onSuccess={m => { setMsg(m); setTab('Tours') }} />}
        {tab === 'Add Bus'  && <AddBusForm  onSuccess={m => { setMsg(m); setTab('Overview') }} />}

        {msg && (
          <div className="success-toast">
            ✅ {msg}
            <button onClick={() => setMsg('')}>✕</button>
          </div>
        )}
      </div>
    </div>
  )
}

function AddTourForm({ onSuccess }) {
  const [form, setForm] = useState({ title:'', origin:'', destination:'', totalDays:'', startDate:'', endDate:'', pricePerPerson:'', busType:'sleeper', totalSeats:40, amenities:'', includedMeals:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await createTour({
        ...form,
        totalDays: Number(form.totalDays), pricePerPerson: Number(form.pricePerPerson), totalSeats: Number(form.totalSeats),
        amenities: form.amenities.split(',').map(s=>s.trim()).filter(Boolean),
        includedMeals: form.includedMeals.split(',').map(s=>s.trim()).filter(Boolean),
        bus: { type: form.busType, amenities: form.amenities.split(',').map(s=>s.trim()).filter(Boolean) },
      })
      onSuccess('Tour created successfully!')
    } catch (err) { alert('Error: ' + err.message) }
    finally { setLoading(false) }
  }

  const f = field => ({ value: form[field], onChange: e => setForm({...form, [field]: e.target.value}) })

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <h3 className="section-head">Add New Tour</h3>
      <div className="form-grid">
        <div className="form-field-admin"><label>Tour Title</label><input placeholder="e.g. Manali Winter Escape" {...f('title')} required /></div>
        <div className="form-field-admin"><label>Bus Type</label>
          <select {...f('busType')}>
            <option value="sleeper">Sleeper</option><option value="semi-sleeper">Semi-Sleeper</option>
            <option value="seater">Seater</option><option value="tempo-traveller">Tempo Traveller</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
        <div className="form-field-admin"><label>From</label><input placeholder="e.g. Amritsar" {...f('origin')} required /></div>
        <div className="form-field-admin"><label>To</label><input placeholder="e.g. Manali" {...f('destination')} required /></div>
        <div className="form-field-admin"><label>Total Days</label><input type="number" placeholder="4" {...f('totalDays')} required /></div>
        <div className="form-field-admin"><label>Price per Person (₹)</label><input type="number" placeholder="4999" {...f('pricePerPerson')} required /></div>
        <div className="form-field-admin"><label>Start Date</label><input type="date" {...f('startDate')} required /></div>
        <div className="form-field-admin"><label>End Date</label><input type="date" {...f('endDate')} required /></div>
        <div className="form-field-admin"><label>Total Seats</label><input type="number" placeholder="40" {...f('totalSeats')} /></div>
        <div className="form-field-admin"><label>Amenities (comma separated)</label><input placeholder="AC, WiFi, Charging Point" {...f('amenities')} /></div>
        <div className="form-field-admin"><label>Included Meals (comma separated)</label><input placeholder="Breakfast, Dinner" {...f('includedMeals')} /></div>
      </div>
      <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Creating...' : 'Create Tour'}</button>
    </form>
  )
}

function AddBusForm({ onSuccess }) {
  const [form, setForm] = useState({ name:'', busNumber:'', type:'sleeper', totalSeats:40, pricePerSeatPerDay:'', amenities:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await createBus({
        ...form,
        totalSeats: Number(form.totalSeats), pricePerSeatPerDay: Number(form.pricePerSeatPerDay),
        amenities: form.amenities.split(',').map(s=>s.trim()).filter(Boolean),
      })
      onSuccess('Bus added successfully!')
    } catch (err) { alert('Error: ' + err.message) }
    finally { setLoading(false) }
  }

  const f = field => ({ value: form[field], onChange: e => setForm({...form, [field]: e.target.value}) })

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <h3 className="section-head">Add New Bus</h3>
      <div className="form-grid">
        <div className="form-field-admin"><label>Bus Name</label><input placeholder="e.g. Punjab Express" {...f('name')} required /></div>
        <div className="form-field-admin"><label>Bus Number</label><input placeholder="e.g. PB-01-1234" {...f('busNumber')} required /></div>
        <div className="form-field-admin"><label>Bus Type</label>
          <select {...f('type')}>
            <option value="sleeper">Sleeper</option><option value="semi-sleeper">Semi-Sleeper</option>
            <option value="seater">Seater</option><option value="tempo-traveller">Tempo Traveller</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
        <div className="form-field-admin"><label>Total Seats</label><input type="number" placeholder="40" {...f('totalSeats')} /></div>
        <div className="form-field-admin"><label>Price per Seat per Day (₹)</label><input type="number" placeholder="500" {...f('pricePerSeatPerDay')} required /></div>
        <div className="form-field-admin"><label>Amenities (comma separated)</label><input placeholder="AC, WiFi, Charging Point" {...f('amenities')} /></div>
      </div>
      <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Adding...' : 'Add Bus'}</button>
    </form>
  )
}
