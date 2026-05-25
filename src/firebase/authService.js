import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

// Register with email/password
export const registerUser = async ({ name, email, password, phone }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })

  // Firestore mein user document banao
  await setDoc(doc(db, 'users', cred.user.uid), {
    name,
    email,
    phone:     phone || '',
    role:      'customer',   // default role
    createdAt: serverTimestamp(),
  })

  return cred.user
}

// Login with email/password
export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

// Google Sign In
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  const cred = await signInWithPopup(auth, provider)

  // Pehli baar login ho toh Firestore mein save karo
  const userRef = doc(db, 'users', cred.user.uid)
  const snap    = await getDoc(userRef)

  if (!snap.exists()) {
    await setDoc(userRef, {
      name:      cred.user.displayName || 'Google User',
      email:     cred.user.email,
      phone:     '',
      role:      'customer',
      createdAt: serverTimestamp(),
    })
  }

  return cred.user
}

// Logout
export const logoutUser = () => signOut(auth)

// Get user profile from Firestore
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { uid, ...snap.data() }
}

// Auth state listener
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback)
