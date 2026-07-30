import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getAllBookings, createTour, createBus, getAllToursAdmin,
  updateTour, toggleTourActive, deleteTour,
  updateBookingStatus, getAllUsers,
} from '../firebase/firestore'
import { seedDemoTours } from '../firebase/seedDemo'
import { fileToCompressedDataUrl } from '../utils/compressImage'

const TABS = ['Overview', 'Bookings', 'Tours', 'Customers', 'Add Tour', 'Add Bus']

const EMPTY_TOUR = {
  title:'', origin:'', destination:'', totalDays:'', startDate:'', endDate:'',
  pricePerPerson:'', busType:'sleeper', totalSeats:40, amenities:'', includedMeals:'',
  description:'', imageUrl:'',
}

export default function AdminDashboard() {
  const { profile }     = useAuth()
  const [tab, setTab]   = useState('Overview')
  const [bookings, setBookings] = useState([])
  const [tours, setTours]       = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [msg, setMsg]           = useState('')
  const [editingTour, setEditingTour] = useState(null)
  const [seeding, setSeeding]   = useState(false)

  const handleSeedDemo = async () => {
    if (!confirm('5 demo tours (Manali, Goa, Char Dham, Jaipur, Kashmir) create karne hain?')) return
    setSeeding(true)
    try {
      const count = await seedDemoTours()
      setMsg(`${count} demo tours created!`)
      loadAll()
    } catch (err) { alert('Error: ' + err.message) }
    finally { setSeeding(false) }
  }

  const loadAll = () => {
    setLoading(true)
    Promise.all([getAllBookings(), getAllToursAdmin(), getAllUsers()])
      .then(([b, t, u]) => { setBookings(b); setTours(t); setUsers(u) })
      .catch(err => setMsg('Load error: ' + err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const confirmedBookings = bookings.filter(b =>
    b.status !== 'cancelled' && (b.status === 'confirmed' || b.payment?.status === 'paid'))
  const revenue = confirmedBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0)
  const customers = users.filter(u => u.role !== 'admin')

  const handleStatusChange = async (booking, status) => {
    try {
      await updateBookingStatus(booking.id, status)
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status } : b))
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleToggleTour = async (tour) => {
    try {
      await toggleTourActive(tour.id, !tour.isActive)
      setTours(prev => prev.map(t => t.id === tour.id ? { ...t, isActive: !tour.isActive } : t))
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleDeleteTour = async (tour) => {
    if (!confirm(`"${tour.title}" delete karna hai? Ye wapas nahi aayega!`)) return
    try {
      await deleteTour(tour.id)
      setTours(prev => prev.filter(t => t.id !== tour.id))
      setMsg('Tour deleted')
    } catch (err) { alert('Error: ' + err.message) }
  }

  // Har user ki booking count nikalo
  const bookingCountByUser = bookings.reduce((acc, b) => {
    if (b.userId) acc[b.userId] = (acc[b.userId] || 0) + 1
    return acc
  }, {})

  const statusBadge = (b) => {
    if (b.status === 'cancelled') return <span className="badge badge-red">Cancelled</span>
    if (b.payment?.status === 'paid' || b.status === 'confirmed') return <span className="badge badge-green">Confirmed</span>
    return <span className="badge badge-terra">Pending</span>
  }

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

        {loading ? <div className="spinner" /> : (
        <>
        {tab === 'Overview' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-num">{bookings.length}</div><div className="stat-label">Total Bookings</div></div>
              <div className="stat-card"><div className="stat-num">{confirmedBookings.length}</div><div className="stat-label">Confirmed</div></div>
              <div className="stat-card"><div className="stat-num">{tours.filter(t=>t.isActive).length}</div><div className="stat-label">Active Tours</div></div>
              <div className="stat-card"><div className="stat-num">{customers.length}</div><div className="stat-label">Customers</div></div>
              <div className="stat-card"><div className="stat-num">₹{revenue.toLocaleString('en-IN')}</div><div className="stat-label">Total Revenue</div></div>
            </div>
            <h3 className="section-head">Recent Bookings</h3>
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
                  <span>{statusBadge(b)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Bookings' && (
          <div>
            <h3 className="section-head">All Bookings ({bookings.length})</h3>
            {bookings.length === 0 ? <p className="admin-empty">No bookings yet.</p> : (
              <div className="admin-booking-list">
                {bookings.map(b => (
                  <div key={b.id} className="admin-booking-card">
                    <div className="admin-booking-top">
                      <div>
                        <span className="booking-id">{b.bookingId}</span>
                        <span className="admin-booking-tour"> · {b.tourTitle || '—'}</span>
                      </div>
                      {statusBadge(b)}
                    </div>
                    <div className="admin-booking-grid">
                      <div><label>Customer</label><p>{b.contact?.name || '—'}</p></div>
                      <div><label>Phone</label><p>{b.contact?.phone || '—'}</p></div>
                      <div><label>Email</label><p>{b.contact?.email || b.userEmail || '—'}</p></div>
                      <div><label>Seats</label><p>{b.selectedSeats?.join(', ') || '—'}</p></div>
                      <div><label>Passengers</label><p>{b.passengers?.length || 0}</p></div>
                      <div><label>Amount</label><p>₹{b.pricing?.totalAmount?.toLocaleString('en-IN') || 0}</p></div>
                      <div><label>Payment</label><p>{b.payment?.status || 'pending'}</p></div>
                      <div><label>Date</label><p>{b.createdAt?.seconds ? new Date(b.createdAt.seconds*1000).toLocaleDateString('en-IN') : '—'}</p></div>
                    </div>
                    {b.status !== 'cancelled' && (
                      <div className="admin-booking-actions">
                        {b.status !== 'confirmed' && (
                          <button className="btn-small btn-small-green" onClick={() => handleStatusChange(b, 'confirmed')}>✓ Confirm</button>
                        )}
                        <button className="btn-small btn-small-red" onClick={() => {
                          if (confirm('Is booking ko cancel karna hai?')) handleStatusChange(b, 'cancelled')
                        }}>✕ Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'Tours' && (
          <div>
            <div className="tours-tab-head">
              <h3 className="section-head">All Tours ({tours.length})</h3>
              <button className="btn-small" onClick={handleSeedDemo} disabled={seeding}>
                {seeding ? 'Loading...' : '✨ Load Demo Tours'}
              </button>
            </div>
            {tours.length === 0 ? <p className="admin-empty">No tours yet — "Add Tour" tab se banao ya "✨ Load Demo Tours" dabao.</p> : (
              <div className="admin-tour-list">
                {tours.map(t => (
                  <div key={t.id} className="admin-tour-row">
                    <div>
                      <div className="admin-tour-name">{t.title}</div>
                      <div className="admin-tour-meta">{t.origin} → {t.destination} · {t.totalDays} days · {t.startDate}</div>
                    </div>
                    <div className="admin-tour-right">
                      <span>₹{t.pricePerPerson?.toLocaleString('en-IN')}/person</span>
                      <span className={`badge ${t.isActive?'badge-green':'badge-stone'}`}>{t.isActive?'Active':'Inactive'}</span>
                      <span>{t.availableSeats} seats left</span>
                      <div className="admin-tour-actions">
                        <button className="btn-small" onClick={() => setEditingTour(t)}>✏️ Edit</button>
                        <button className="btn-small" onClick={() => handleToggleTour(t)}>
                          {t.isActive ? '⏸ Deactivate' : '▶ Activate'}
                        </button>
                        <button className="btn-small btn-small-red" onClick={() => handleDeleteTour(t)}>🗑 Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'Customers' && (
          <div>
            <h3 className="section-head">All Customers ({customers.length})</h3>
            {customers.length === 0 ? <p className="admin-empty">No customers registered yet.</p> : (
              <div className="admin-table">
                <div className="admin-table-head customers-head">
                  <span>Name</span><span>Email</span><span>Phone</span><span>Bookings</span><span>Joined</span>
                </div>
                {customers.map(u => (
                  <div key={u.uid} className="admin-table-row customers-head">
                    <span className="customer-name">{u.name || '—'}</span>
                    <span>{u.email}</span>
                    <span>{u.phone || '—'}</span>
                    <span>{bookingCountByUser[u.uid] || 0}</span>
                    <span>{u.createdAt?.seconds ? new Date(u.createdAt.seconds*1000).toLocaleDateString('en-IN') : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'Add Tour' && (
          <TourForm onSuccess={m => { setMsg(m); setTab('Tours'); loadAll() }} />
        )}
        {tab === 'Add Bus'  && <AddBusForm onSuccess={m => { setMsg(m); setTab('Overview') }} />}
        </>
        )}

        {editingTour && (
          <div className="modal-overlay" onClick={() => setEditingTour(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Tour</h3>
                <button className="modal-close" onClick={() => setEditingTour(null)}>✕</button>
              </div>
              <TourForm
                existing={editingTour}
                onSuccess={m => { setMsg(m); setEditingTour(null); loadAll() }}
              />
            </div>
          </div>
        )}

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

// Ek hi form Add + Edit dono ke liye — `existing` pass karo to edit mode
function TourForm({ existing, onSuccess }) {
  const [form, setForm] = useState(() => existing ? {
    title:          existing.title || '',
    origin:         existing.origin || '',
    destination:    existing.destination || '',
    totalDays:      existing.totalDays || '',
    startDate:      existing.startDate || '',
    endDate:        existing.endDate || '',
    pricePerPerson: existing.pricePerPerson || '',
    busType:        existing.bus?.type || existing.busType || 'sleeper',
    totalSeats:     existing.totalSeats || 40,
    amenities:      (existing.bus?.amenities || existing.amenities || []).join(', '),
    includedMeals:  (existing.includedMeals || []).join(', '),
    description:    existing.description || '',
    imageUrl:       existing.imageUrl || '',
  } : { ...EMPTY_TOUR })

  const [stops, setStops] = useState(existing?.stops?.length
    ? existing.stops : [])
  const [foodMenu, setFoodMenu] = useState(existing?.foodMenu?.length
    ? existing.foodMenu : [])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      setForm(prev => ({ ...prev, imageUrl: dataUrl }))
    } catch (err) { alert(err.message) }
    finally { setUploading(false); e.target.value = '' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const amenities = form.amenities.split(',').map(s=>s.trim()).filter(Boolean)
      const data = {
        ...form,
        totalDays: Number(form.totalDays),
        pricePerPerson: Number(form.pricePerPerson),
        totalSeats: Number(form.totalSeats),
        amenities,
        includedMeals: form.includedMeals.split(',').map(s=>s.trim()).filter(Boolean),
        bus: { type: form.busType, amenities },
        stops: stops.filter(s => s.place),
        foodMenu: foodMenu.filter(f => f.name && f.price).map(f => ({ ...f, price: Number(f.price) })),
      }
      if (existing) {
        await updateTour(existing.id, data)
        onSuccess('Tour updated successfully!')
      } else {
        await createTour(data)
        onSuccess('Tour created successfully!')
      }
    } catch (err) { alert('Error: ' + err.message) }
    finally { setLoading(false) }
  }

  const f = field => ({ value: form[field], onChange: e => setForm({...form, [field]: e.target.value}) })

  const updateStop = (i, field, value) =>
    setStops(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  const updateFood = (i, field, value) =>
    setFoodMenu(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  return (
    <form onSubmit={handleSubmit} className="add-form">
      {!existing && <h3 className="section-head">Add New Tour</h3>}
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
        <div className="form-field-admin form-field-wide"><label>Tour Image</label>
          <div className="img-upload-row">
            <label className="img-upload-btn">
              {uploading ? '⏳ Processing...' : '📁 Upload Image'}
              <input type="file" accept="image/*" hidden disabled={uploading}
                onChange={handleImageFile} />
            </label>
            <span className="img-upload-or">ya URL paste karo:</span>
            <input className="img-url-input" placeholder="https://..."
              value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          {form.imageUrl && (
            <div className="img-preview-wrap">
              <img className="form-img-preview" src={form.imageUrl} alt="Preview"
                onError={e => { e.currentTarget.style.display = 'none' }}
                onLoad={e => { e.currentTarget.style.display = 'block' }} />
              <button type="button" className="btn-small btn-small-red img-remove-btn"
                onClick={() => setForm({ ...form, imageUrl: '' })}>✕ Remove Image</button>
            </div>
          )}
        </div>
        <div className="form-field-admin form-field-wide"><label>Description</label>
          <textarea rows="3" placeholder="Tour ke baare mein likho — kya dekhne milega, kya khaas hai..." {...f('description')} /></div>
      </div>

      {/* Itinerary / Stops */}
      <div className="form-section">
        <div className="form-section-head">
          <h4>Itinerary Stops</h4>
          <button type="button" className="btn-small" onClick={() => setStops([...stops, { place:'', day:'', arrivalTime:'' }])}>+ Add Stop</button>
        </div>
        {stops.length === 0 && <p className="form-hint">Koi stop nahi — "+ Add Stop" se itinerary banao (customer ko Tour Detail page pe dikhega)</p>}
        {stops.map((s, i) => (
          <div key={i} className="dynamic-row">
            <input placeholder="Place (e.g. Mandi)" value={s.place} onChange={e => updateStop(i, 'place', e.target.value)} />
            <input type="number" placeholder="Day" min="1" value={s.day} onChange={e => updateStop(i, 'day', e.target.value)} />
            <input placeholder="Arrival (e.g. 8:00 AM)" value={s.arrivalTime} onChange={e => updateStop(i, 'arrivalTime', e.target.value)} />
            <button type="button" className="row-remove" onClick={() => setStops(stops.filter((_, idx) => idx !== i))}>✕</button>
          </div>
        ))}
      </div>

      {/* Food Menu */}
      <div className="form-section">
        <div className="form-section-head">
          <h4>Food Menu</h4>
          <button type="button" className="btn-small" onClick={() => setFoodMenu([...foodMenu, { name:'', meal:'breakfast', price:'', isVeg:true }])}>+ Add Item</button>
        </div>
        {foodMenu.length === 0 && <p className="form-hint">Koi food item nahi — customer ko booking ke time meals add karne ka option milega</p>}
        {foodMenu.map((fd, i) => (
          <div key={i} className="dynamic-row">
            <input placeholder="Item (e.g. Chole Bhature)" value={fd.name} onChange={e => updateFood(i, 'name', e.target.value)} />
            <select value={fd.meal} onChange={e => updateFood(i, 'meal', e.target.value)}>
              <option value="breakfast">Breakfast</option><option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option><option value="snacks">Snacks</option>
            </select>
            <input type="number" placeholder="₹ Price" value={fd.price} onChange={e => updateFood(i, 'price', e.target.value)} />
            <select value={fd.isVeg ? 'veg' : 'nonveg'} onChange={e => updateFood(i, 'isVeg', e.target.value === 'veg')}>
              <option value="veg">🟢 Veg</option><option value="nonveg">🔴 Non-Veg</option>
            </select>
            <button type="button" className="row-remove" onClick={() => setFoodMenu(foodMenu.filter((_, idx) => idx !== i))}>✕</button>
          </div>
        ))}
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Saving...' : existing ? 'Update Tour' : 'Create Tour'}
      </button>
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
