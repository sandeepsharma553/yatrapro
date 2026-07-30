import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getTours } from '../firebase/firestore'
import TourCard from '../components/TourCard'

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
            {filtered.map(tour => <TourCard key={tour.id} tour={tour} />)}
          </div>
        )}
      </div>
    </div>
  )
}
