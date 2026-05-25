import {
  collection, doc, getDoc, getDocs,
  addDoc, updateDoc, query, where,
  orderBy, serverTimestamp, arrayUnion, increment
} from 'firebase/firestore'
import { db } from './config'

// ── TOURS ────────────────────────────────────────────────

export const getTours = async ({ origin, destination, date } = {}) => {
  let q = query(collection(db, 'tours'), where('isActive', '==', true))
  const snap = await getDocs(q)
  let tours = snap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Client-side filter (Firestore free tier mein compound queries limited hain)
  if (origin)      tours = tours.filter(t => t.origin?.toLowerCase().includes(origin.toLowerCase()))
  if (destination) tours = tours.filter(t => t.destination?.toLowerCase().includes(destination.toLowerCase()))
  if (date)        tours = tours.filter(t => t.startDate >= date)

  return tours
}

export const getTourById = async (id) => {
  const snap = await getDoc(doc(db, 'tours', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

// ── BOOKINGS ─────────────────────────────────────────────

export const createBooking = async (bookingData) => {
  const { tourId, selectedSeats } = bookingData

  // 1. Booking document create karo
  const bookingRef = await addDoc(collection(db, 'bookings'), {
    ...bookingData,
    status: 'pending',
    payment: { status: 'pending' },
    createdAt: serverTimestamp(),
    bookingId: `BUS-${Date.now()}`,
  })

  // 2. Tour mein booked seats update karo
  await updateDoc(doc(db, 'tours', tourId), {
    bookedSeats:    arrayUnion(...selectedSeats),
    availableSeats: increment(-selectedSeats.length),
  })

  return bookingRef.id
}

export const getUserBookings = async (userId) => {
  const q    = query(collection(db, 'bookings'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateBookingPayment = async (bookingId, paymentData) => {
  await updateDoc(doc(db, 'bookings', bookingId), {
    'payment.status':      'paid',
    'payment.orderId':     paymentData.razorpay_order_id,
    'payment.paymentId':   paymentData.razorpay_payment_id,
    'payment.signature':   paymentData.razorpay_signature,
    'payment.paidAt':      serverTimestamp(),
    status: 'confirmed',
  })
}

// ── BUSES ────────────────────────────────────────────────

export const getBuses = async () => {
  const snap = await getDocs(query(collection(db, 'buses'), where('isActive', '==', true)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── ADMIN ────────────────────────────────────────────────

export const createTour = async (tourData) => {
  const ref = await addDoc(collection(db, 'tours'), {
    ...tourData,
    bookedSeats:    [],
    availableSeats: tourData.totalSeats || 40,
    isActive:       true,
    createdAt:      serverTimestamp(),
  })
  return ref.id
}

export const createBus = async (busData) => {
  const ref = await addDoc(collection(db, 'buses'), {
    ...busData,
    isActive:  true,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getAllBookings = async () => {
  const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
