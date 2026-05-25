import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthChange, registerUser, loginUser, loginWithGoogle, logoutUser, getUserProfile } from '../firebase/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)  // Firebase Auth user
  const [profile, setProfile] = useState(null)  // Firestore user document
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const prof = await getUserProfile(firebaseUser.uid)
          setProfile(prof)
        } catch (e) {
          // Profile fetch fail hone pe bhi chalta rahe
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Display name — Firebase Auth displayName ya Firestore name
  const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User'

  const register = async (data) => {
    const u = await registerUser(data)
    return u
  }

  const login = async (email, password) => {
    const u = await loginUser(email, password)
    return u
  }

  const loginGoogle = async () => {
    const u = await loginWithGoogle()
    return u
  }

  const logout = () => logoutUser()

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      displayName,
      register,
      login,
      loginGoogle,
      logout,
      isAdmin: profile?.role === 'admin',
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
