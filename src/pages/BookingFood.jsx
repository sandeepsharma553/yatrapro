import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTourById } from '../firebase/firestore'

export default function BookingFood() {
  const navigate  = useNavigate()
  const draft     = JSON.parse(sessionStorage.getItem('bookingDraft') || '{}')
  const [foodMenu, setFoodMenu] = useState([])
  const [orders, setOrders]     = useState({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!draft.tourId) { navigate('/'); return }
    getTourById(draft.tourId)
      .then(tour => setFoodMenu(tour?.foodMenu || []))
      .catch(() => setFoodMenu([]))
      .finally(() => setLoading(false))
  }, [])

  const toggle    = (id) => setOrders(prev => ({ ...prev, [id]: prev[id] ? 0 : 1 }))
  const changeQty = (id, d) => setOrders(prev => ({ ...prev, [id]: Math.max(0, (prev[id]||0) + d) }))
  const foodTotal = foodMenu.reduce((sum, f) => sum + (orders[f.id||f.name]||0) * f.price, 0)

  const handleProceed = () => {
    const foodOrders = foodMenu
      .filter(f => orders[f.id||f.name] > 0)
      .map(f => ({ foodItem:f.name, meal:f.meal, quantity:orders[f.id||f.name], price:f.price }))
    sessionStorage.setItem('bookingDraft', JSON.stringify({
      ...draft, foodOrders,
      pricing: { ...draft.pricing, foodCharges:foodTotal, totalAmount:(draft.pricing?.totalAmount||0) + foodTotal }
    }))
    navigate('/booking/payment')
  }

  if (loading) return <div className="page-pt"><div className="spinner" /></div>

  return (
    <div className="page-pt pb-80">
      <div className="container">
        <h1 className="page-title">Add Meals 🍛</h1>
        <p className="page-sub">Add food for your journey (optional)</p>
        <div className="food-layout">
          <div className="food-menu">
            {foodMenu.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 24px', color:'#7A6E68' }}>
                <span style={{ fontSize:48 }}>🍽️</span>
                <p style={{ marginTop:12 }}>No food menu available for this tour.</p>
              </div>
            ) : foodMenu.map(food => {
              const key = food.id || food.name
              return (
                <div key={key} className={`food-card ${orders[key] > 0 ? 'selected' : ''}`}>
                  <div className="food-info">
                    <span className="veg-dot">{food.isVeg !== false ? '🟢' : '🔴'}</span>
                    <div>
                      <div className="food-name">{food.name}</div>
                      <div className="food-meal">{food.meal}</div>
                    </div>
                    <div className="food-price">₹{food.price}</div>
                  </div>
                  <div className="food-actions">
                    {orders[key] > 0 ? (
                      <div className="qty-ctrl">
                        <button onClick={() => changeQty(key, -1)}>−</button>
                        <span>{orders[key]}</span>
                        <button onClick={() => changeQty(key, +1)}>+</button>
                      </div>
                    ) : (
                      <button className="add-btn" onClick={() => toggle(key)}>+ Add</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="food-summary">
            <h3>Order Summary</h3>
            {foodTotal > 0
              ? foodMenu.filter(f => orders[f.id||f.name] > 0).map(f => {
                  const key = f.id || f.name
                  return <div key={key} className="sum-row"><span>{f.name} × {orders[key]}</span><span>₹{f.price * orders[key]}</span></div>
                })
              : <p style={{ color:'#7A6E68', fontSize:14 }}>No items selected</p>
            }
            {foodTotal > 0 && <div className="sum-total"><span>Food Total</span><span>₹{foodTotal}</span></div>}
            <button className="proceed-food-btn" onClick={handleProceed}>Go to Payment →</button>
            <button className="skip-btn" onClick={handleProceed}>Skip — No Food Required</button>
          </div>
        </div>
      </div>
    </div>
  )
}
