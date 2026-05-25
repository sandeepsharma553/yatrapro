import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTours } from '../firebase/firestore'

const WHY = [
  { icon: '🛋️', title: 'Comfortable Buses',  desc: 'Travel in sleeper, semi-sleeper and luxury buses' },
  { icon: '🍛', title: 'Meals Included',      desc: 'Delicious food on the way — breakfast to dinner' },
  { icon: '💳', title: 'Easy Payment',        desc: 'UPI, card, net banking — pay however you like' },
  { icon: '📱', title: 'Instant Ticket',      desc: 'Get your ticket on email right after booking' },
]

export default function Home() {
  const navigate = useNavigate()
  const [form, setForm]         = useState({ origin: '', destination: '', date: '' })
  const [popularTours, setPopularTours] = useState([])

  useEffect(() => {
    getTours().then(data => setPopularTours(data.slice(0, 4))).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/search?${new URLSearchParams(form)}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-content">
          <p className="home-eyebrow">India's Best Group Tours</p>
          <h1 className="home-title">Book Your Next<br /><span>Adventure</span></h1>
          <p className="home-subtitle">Comfortable group bus tours — meals, hotel and guide all included</p>
          <form className="search-card" onSubmit={handleSearch}>
            <div className="search-row">
              <div className="search-field">
                <label>From</label>
                <input type="text" placeholder="e.g. Amritsar" value={form.origin}
                  onChange={e => setForm({...form, origin: e.target.value})} />
              </div>
              <div className="search-divider">→</div>
              <div className="search-field">
                <label>To</label>
                <input type="text" placeholder="e.g. Manali" value={form.destination}
                  onChange={e => setForm({...form, destination: e.target.value})} />
              </div>
              <div className="search-field">
                <label>Travel Date</label>
                <input type="date" value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <button type="submit" className="search-btn">Search Tours</button>
            </div>
          </form>
        </div>
      </section>

      {/* Popular Tours */}
      {popularTours.length > 0 && (
        <section className="home-section">
          <div className="container">
            <h2 className="section-title">Popular Tours</h2>
            <p className="section-sub">Explore our available destinations</p>
            <div className="routes-grid">
              {popularTours.map(tour => (
                <button key={tour.id} className="route-card"
                  onClick={() => navigate(`/search?origin=${tour.origin}&destination=${tour.destination}`)}>
                  <span className="route-emoji">🏔️</span>
                  <div className="route-info">
                    <div className="route-title">{tour.origin} → {tour.destination}</div>
                    <div className="route-days">{tour.totalDays} days · ₹{tour.pricePerPerson?.toLocaleString('en-IN')}/person</div>
                  </div>
                  <span className="route-arrow">›</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why YatraPro */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title">Why YatraPro?</h2>
          <div className="why-grid">
            {WHY.map(w => (
              <div key={w.title} className="why-card">
                <span className="why-icon">{w.icon}</span>
                <h3 className="why-title">{w.title}</h3>
                <p className="why-desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>10% off on your first booking!</h2>
            <p>Register now and get a special discount</p>
            <button className="cta-btn" onClick={() => navigate('/register')}>Register for Free</button>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">© 2025 YatraPro · Made with ❤️ for India</div>
      </footer>
    </div>
  )
}
