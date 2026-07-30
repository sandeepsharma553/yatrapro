import { Link } from 'react-router-dom'

const TYPE_LABELS = {
  sleeper: '🛏️ Sleeper', 'semi-sleeper': '💺 Semi-Sleeper', seater: '💺 Seater',
  'tempo-traveller': '🚐 Tempo', luxury: '✨ Luxury',
}

// Destination ke hisaab se emoji (image na ho to)
const DEST_EMOJI = [
  [/goa|beach|puri/i, '🏖️'], [/manali|shimla|kashmir|leh|ladakh|himachal/i, '🏔️'],
  [/kedarnath|badrinath|char ?dham|vaishno|amritsar|varanasi|haridwar|rishikesh|ujjain|tirupati/i, '🛕'],
  [/jaipur|udaipur|jodhpur|rajasthan|agra|delhi/i, '🏰'], [/kerala|munnar|ooty/i, '🌴'],
]

export default function TourCard({ tour }) {
  const busType = tour.bus?.type || tour.busType
  const emoji = DEST_EMOJI.find(([re]) => re.test(tour.destination || '') || re.test(tour.title || ''))?.[1] || '🏔️'

  return (
    <Link to={`/tours/${tour.id}`} className="tour-card">
      <div className="tour-card-img">
        <div className="tour-card-img-placeholder">{emoji}</div>
        {tour.imageUrl && (
          <img className="tour-card-photo" src={tour.imageUrl} alt={tour.title}
            loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }} />
        )}
        {busType && <span className="tour-card-badge">{TYPE_LABELS[busType] || `🚌 ${busType}`}</span>}
        {tour.availableSeats <= 5 && tour.availableSeats > 0 && (
          <span className="tour-card-urgency">🔥 Only {tour.availableSeats} left!</span>
        )}
      </div>
      <div className="tour-card-body">
        <h3 className="tour-card-title">{tour.title}</h3>
        <p className="tour-card-route">📍 {tour.origin} → {tour.destination}</p>
        <div className="tour-card-meta">
          <span>📅 {tour.totalDays} days</span>
          <span>💺 {tour.availableSeats} seats left</span>
        </div>
        {(tour.bus?.amenities?.length > 0) && (
          <div className="tour-card-tags">
            {tour.bus.amenities.slice(0, 3).map(a => <span key={a} className="tag">{a}</span>)}
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
}
