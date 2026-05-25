import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, loginGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await register(form); navigate('/') }
    catch (err) { setError(getFirebaseError(err.code)) }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setError(''); setLoading(true)
    try { await loginGoogle(); navigate('/') }
    catch { setError('Google sign-in failed. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page page-pt">
      <div className="auth-card">
        <div className="auth-logo">🚌 YatraPro</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Register for free</p>
        {error && <div className="auth-error">{error}</div>}
        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
          Continue with Google
        </button>
        <div className="auth-divider"><span>or</span></div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field"><label>Full Name</label>
            <input type="text" placeholder="Your full name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="form-field"><label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div className="form-field"><label>Phone Number</label>
            <input type="tel" placeholder="98XXXXXXXX" value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})} required /></div>
          <div className="form-field"><label>Password</label>
            <input type="password" placeholder="At least 6 characters" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required minLength={6} /></div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

function getFirebaseError(code) {
  const e = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Invalid email address.',
  }
  return e[code] || 'Registration failed. Please try again.'
}
