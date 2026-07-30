import {
  collection, doc, getDoc, getDocs,
  addDoc, updateDoc, deleteDoc, query, where,
  orderBy, serverTimestamp, arrayUnion, arrayRemove, increment
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
  // orderBy + where saath mein composite index maangta hai — client-side sort karo
  const q    = query(collection(db, 'bookings'), where('userId', '==', userId))
  const snap = await getDocs(q)
  const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return bookings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

// Abhi payment skip — booking directly confirm karo (pay later)
export const confirmBookingWithoutPayment = async (bookingId) => {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'confirmed',
    'payment.status': 'pay-later',
    'payment.confirmedAt': serverTimestamp(),
  })
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

// Booking cancel karo — seats wapas free karo
export const cancelBooking = async (booking) => {
  await updateDoc(doc(db, 'bookings', booking.id), {
    status: 'cancelled',
    cancelledAt: serverTimestamp(),
  })
  if (booking.tourId && booking.selectedSeats?.length) {
    await updateDoc(doc(db, 'tours', booking.tourId), {
      bookedSeats:    arrayRemove(...booking.selectedSeats),
      availableSeats: increment(booking.selectedSeats.length),
    })
  }
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

export const updateTour = async (tourId, tourData) => {
  await updateDoc(doc(db, 'tours', tourId), {
    ...tourData,
    updatedAt: serverTimestamp(),
  })
}

export const toggleTourActive = async (tourId, isActive) => {
  await updateDoc(doc(db, 'tours', tourId), { isActive })
}

export const deleteTour = async (tourId) => {
  await deleteDoc(doc(db, 'tours', tourId))
}

// Admin ke liye saare tours (inactive bhi)
export const getAllToursAdmin = async () => {
  const snap = await getDocs(collection(db, 'tours'))
  const tours = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return tours.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
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

// Admin booking ka status badal sake (confirm / cancel)
export const updateBookingStatus = async (bookingId, status) => {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

// Saare customers ki list (admin ke liye)
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'))
  const users = snap.docs.map(d => ({ uid: d.id, ...d.data() }))
  return users.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}
