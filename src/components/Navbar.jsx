import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, displayName, logout, isAdmin } = useAuth()
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }
  const firstName = displayName?.split(' ')[0] || 'User'

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-icon">🚌</span>
          <span className="nav-logo-text">YatraPro</span>
        </Link>
        <div className="nav-links">
          <Link to="/search" className="nav-link">Tours</Link>
          {user && <Link to="/my-bookings" className="nav-link">My Bookings</Link>}
          {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-username">Hello, {firstName}!</span>
              {profile?.role && (
                <span className="nav-role-badge">
                  {profile.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              )}
              <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="nav-login-btn">Login</Link>
              <Link to="/register" className="nav-register-btn">Register</Link>
            </>
          )}
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      {menuOpen && (
        <div className="nav-mobile-menu">
          <Link to="/search" onClick={() => setMenuOpen(false)}>Tours</Link>
          {user && <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>My Bookings</Link>}
          {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
          {user ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false) }}>Logout</button>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
