import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loginGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(form.email, form.password); navigate('/') }
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
        <h1 className="auth-title">Welcome Back!</h1>
        <p className="auth-sub">Login to your account</p>
        {error && <div className="auth-error">{error}</div>}
        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
          Continue with Google
        </button>
        <div className="auth-divider"><span>or</span></div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  )
}

function getFirebaseError(code) {
  const e = {
    'auth/user-not-found':     'No account found with this email.',
    'auth/wrong-password':     'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests':  'Too many attempts. Try again later.',
  }
  return e[code] || 'Login failed. Please try again.'
}
