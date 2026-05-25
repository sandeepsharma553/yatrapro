import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { getTours } from '../firebase/firestore'

const BUS_TYPES = ['All', 'sleeper', 'semi-sleeper', 'seater', 'tempo-traveller', 'luxury']

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [tours, setTours]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [busFilter, setBusFilter] = useState('All')
  const [sortBy, setSortBy]       = useState('price-low')

  const origin      = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date        = searchParams.get('date') || ''

  useEffect(() => {
    setLoading(true)
    getTours({ origin, destination, date })
      .then(data => setTours(data))
      .catch(() => setTours([]))
      .finally(() => setLoading(false))
  }, [origin, destination, date])

  const filtered = tours
    .filter(t => busFilter === 'All' || (t.bus?.type || t.busType) === busFilter)
    .sort((a, b) => {
      if (sortBy === 'price-low')  return a.pricePerPerson - b.pricePerPerson
      if (sortBy === 'price-high') return b.pricePerPerson - a.pricePerPerson
      if (sortBy === 'days')       return a.totalDays - b.totalDays
      return 0
    })

  const typeLabels = { sleeper:'🛏️ Sleeper','semi-sleeper':'💺 Semi-Sleeper',seater:'💺 Seater','tempo-traveller':'🚐 Tempo',luxury:'✨ Luxury' }

  return (
    <div className="page-pt pb-80">
      <div className="search-header">
        <div className="container">
          <div className="search-header-top">
            <div>
              <h1 className="search-header-title">{origin && destination ? `${origin} → ${destination}` : 'All Tours'}</h1>
              <p className="search-header-sub">{loading ? 'Searching...' : `${filtered.length} tours found`}{date && ` · ${new Date(date).toLocaleDateString('en-IN')}`}</p>
            </div>
            <button className="btn-outline" onClick={() => navigate('/')}>New Search</button>
          </div>
          <div className="filters-row">
            <div className="bus-filters">
              {BUS_TYPES.map(type => (
                <button key={type} className={`filter-btn ${busFilter === type ? 'active' : ''}`}
                  onClick={() => setBusFilter(type)}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="days">Shortest Duration</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? <div className="spinner" /> :
         filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🗺️</span>
            <h3>No tours found</h3>
            <p>No tours available for this route yet.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Go Back</button>
          </div>
        ) : (
          <div className="tours-grid">
            {filtered.map(tour => {
              const busType = tour.bus?.type || tour.busType
              return (
                <Link key={tour.id} to={`/tours/${tour.id}`} className="tour-card">
                  <div className="tour-card-img">
                    <div className="tour-card-img-placeholder">🏔️</div>
                    <span className="tour-card-badge">{typeLabels[busType] || busType}</span>
                  </div>
                  <div className="tour-card-body">
                    <h3 className="tour-card-title">{tour.title}</h3>
                    <p className="tour-card-route">📍 {tour.origin} → {tour.destination}</p>
                    <div className="tour-card-meta">
                      <span>📅 {tour.totalDays} days</span>
                      <span>💺 {tour.availableSeats} seats left</span>
                    </div>
                    {tour.bus?.amenities?.length > 0 && (
                      <div className="tour-card-tags">
                        {tour.bus.amenities.slice(0,3).map(a => <span key={a} className="tag">{a}</span>)}
                      </div>
                    )}
                    <div className="tour-card-footer">
                      <div>
                        <span className="tour-price-num">₹{tour.pricePerPerson?.toLocaleString('en-IN')}</span>
                        <span className="tour-price-label">/person</span>
                      </div>
                      <span className="tour-book-btn">Book Now →</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
