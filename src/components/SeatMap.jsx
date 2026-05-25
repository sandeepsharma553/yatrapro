export default function SeatMap({ busType, totalSeats, bookedSeats, selectedSeats, onSelect }) {
  const layout = getLayout(busType, totalSeats)

  const getStatus = (seatId) => {
    if (bookedSeats.includes(seatId))   return 'booked'
    if (selectedSeats.includes(seatId)) return 'selected'
    return 'available'
  }

  const handleClick = (seatId) => {
    const status = getStatus(seatId)
    if (status === 'booked') return
    if (status === 'selected') {
      onSelect(selectedSeats.filter(s => s !== seatId))
    } else {
      if (selectedSeats.length >= 6) { alert('Maximum 6 seats can be selected at a time'); return }
      onSelect([...selectedSeats, seatId])
    }
  }

  return (
    <div className="seatmap-wrapper">
      <div className="seatmap-legend">
        <span className="seatmap-legend-item"><span className="seatmap-dot available" /> Available</span>
        <span className="seatmap-legend-item"><span className="seatmap-dot selected" /> Your Seat</span>
        <span className="seatmap-legend-item"><span className="seatmap-dot booked"   /> Booked</span>
      </div>
      <div className="seatmap-bus">
        <div className="seatmap-driver-row">
          <span className="seatmap-driver">🚌 Driver</span>
          <span className="seatmap-door">Door</span>
        </div>
        {layout.map((deck, di) => (
          <div key={di} className="seatmap-deck">
            {deck.label && <div className="seatmap-deck-label">{deck.label}</div>}
            <div className="seatmap-grid">
              {deck.rows.map((row, ri) => (
                <div key={ri} className="seatmap-row">
                  {row.map((seat, si) =>
                    seat === 'aisle'
                      ? <div key={si} className="seatmap-aisle" />
                      : (
                        <button key={seat}
                          className={`seat ${getStatus(seat)}`}
                          onClick={() => handleClick(seat)}
                          disabled={getStatus(seat) === 'booked'}
                          title={seat}>
                          <span className="seat-icon">{busType === 'sleeper' ? '🛏' : '💺'}</span>
                          <span className="seat-num">{seat}</span>
                        </button>
                      )
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedSeats.length > 0 && (
        <div className="seatmap-selection-bar">
          <span>{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected: <strong>{selectedSeats.join(', ')}</strong></span>
          <button className="seatmap-clear-btn" onClick={() => onSelect([])}>Clear</button>
        </div>
      )}
    </div>
  )
}

function getLayout(busType, totalSeats) {
  if (busType === 'tempo-traveller') {
    const rows = []
    for (let r = 1; r <= Math.ceil(totalSeats / 3); r++) rows.push([`A${r}`, `B${r}`, `C${r}`])
    return [{ rows }]
  }
  if (busType === 'sleeper') {
    const perDeck = Math.floor(totalSeats / 2)
    const makeRows = (p) => {
      const rows = []
      for (let r = 1; r <= Math.ceil(perDeck / 3); r++) rows.push([`${p}${r}L`, `${p}${r}M`, 'aisle', `${p}${r}R`])
      return rows
    }
    return [{ label: '⬇️ Lower Deck', rows: makeRows('L') }, { label: '⬆️ Upper Deck', rows: makeRows('U') }]
  }
  const rows = []
  for (let r = 1; r <= Math.ceil(totalSeats / 4); r++) rows.push([`A${r}`, `B${r}`, 'aisle', `C${r}`, `D${r}`])
  return [{ rows }]
}
