import { createTour } from './firestore'

// Demo ke liye ready-made attractive tours — admin ek click mein load kar sakta hai
const DEMO_TOURS = [
  {
    title: 'Manali Winter Escape',
    origin: 'Amritsar', destination: 'Manali',
    totalDays: 4, pricePerPerson: 5999, totalSeats: 40, busType: 'sleeper',
    startDate: '2026-08-20', endDate: '2026-08-23',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=60',
    description: 'Baraf se dhaki vaadiyan, Solang Valley mein adventure sports aur Mall Road ki shopping — Manali ka perfect winter package. Hotel, meals aur guide sab included.',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket'],
    includedMeals: ['Breakfast', 'Dinner'],
    stops: [
      { place: 'Chandigarh', day: '1', arrivalTime: '11:00 AM' },
      { place: 'Mandi', day: '1', arrivalTime: '5:00 PM' },
      { place: 'Manali', day: '2', arrivalTime: '8:00 AM' },
      { place: 'Solang Valley', day: '3', arrivalTime: '9:00 AM' },
    ],
    foodMenu: [
      { name: 'Aloo Paratha + Dahi', meal: 'breakfast', price: 80, isVeg: true },
      { name: 'Rajma Chawal', meal: 'lunch', price: 120, isVeg: true },
      { name: 'Butter Chicken + Naan', meal: 'dinner', price: 220, isVeg: false },
      { name: 'Veg Thali', meal: 'dinner', price: 150, isVeg: true },
    ],
  },
  {
    title: 'Goa Beach Party',
    origin: 'Delhi', destination: 'Goa',
    totalDays: 5, pricePerPerson: 8999, totalSeats: 36, busType: 'luxury',
    startDate: '2026-09-05', endDate: '2026-09-09',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=60',
    description: 'Baga Beach, Fort Aguada, cruise party aur North Goa ke famous beaches — sab kuch is 5-din ke luxury package mein. Young groups ke liye perfect!',
    amenities: ['AC', 'WiFi', 'Recliner Seats', 'Entertainment Screen'],
    includedMeals: ['Breakfast'],
    stops: [
      { place: 'Jaipur', day: '1', arrivalTime: '2:00 PM' },
      { place: 'Mumbai', day: '2', arrivalTime: '10:00 AM' },
      { place: 'Goa (Baga)', day: '3', arrivalTime: '8:00 AM' },
    ],
    foodMenu: [
      { name: 'Poha + Chai', meal: 'breakfast', price: 60, isVeg: true },
      { name: 'Fish Curry Rice', meal: 'lunch', price: 180, isVeg: false },
      { name: 'Paneer Tikka Roll', meal: 'snacks', price: 100, isVeg: true },
    ],
  },
  {
    title: 'Char Dham Yatra',
    origin: 'Haridwar', destination: 'Kedarnath',
    totalDays: 10, pricePerPerson: 15999, totalSeats: 30, busType: 'semi-sleeper',
    startDate: '2026-09-15', endDate: '2026-09-24',
    imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=60',
    description: 'Yamunotri, Gangotri, Kedarnath aur Badrinath — chaaron dhaam ki pavitra yatra experienced guide ke saath. Saatvik bhojan aur aaramdayak rukne ki vyavastha.',
    amenities: ['AC', 'First Aid', 'Oxygen Support', 'Charging Point'],
    includedMeals: ['Breakfast', 'Lunch', 'Dinner'],
    stops: [
      { place: 'Barkot (Yamunotri)', day: '2', arrivalTime: '4:00 PM' },
      { place: 'Uttarkashi (Gangotri)', day: '4', arrivalTime: '3:00 PM' },
      { place: 'Guptkashi (Kedarnath)', day: '6', arrivalTime: '5:00 PM' },
      { place: 'Badrinath', day: '8', arrivalTime: '12:00 PM' },
    ],
    foodMenu: [
      { name: 'Saatvik Thali', meal: 'lunch', price: 130, isVeg: true },
      { name: 'Khichdi + Kadhi', meal: 'dinner', price: 100, isVeg: true },
      { name: 'Fruit Plate', meal: 'snacks', price: 70, isVeg: true },
    ],
  },
  {
    title: 'Royal Rajasthan',
    origin: 'Delhi', destination: 'Jaipur',
    totalDays: 3, pricePerPerson: 4499, totalSeats: 45, busType: 'seater',
    startDate: '2026-08-28', endDate: '2026-08-30',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60',
    description: 'Hawa Mahal, Amber Fort, City Palace aur Chokhi Dhani ka authentic Rajasthani dinner — Pink City ka shahi anubhav sirf 3 dino mein.',
    amenities: ['AC', 'WiFi', 'Charging Point'],
    includedMeals: ['Breakfast', 'Dinner'],
    stops: [
      { place: 'Neemrana', day: '1', arrivalTime: '10:00 AM' },
      { place: 'Jaipur (Amber Fort)', day: '1', arrivalTime: '2:00 PM' },
      { place: 'Chokhi Dhani', day: '2', arrivalTime: '6:00 PM' },
    ],
    foodMenu: [
      { name: 'Pyaaz Kachori', meal: 'breakfast', price: 50, isVeg: true },
      { name: 'Dal Baati Churma', meal: 'lunch', price: 160, isVeg: true },
      { name: 'Laal Maas + Bajra Roti', meal: 'dinner', price: 240, isVeg: false },
    ],
  },
  {
    title: 'Kashmir Paradise',
    origin: 'Jammu', destination: 'Srinagar',
    totalDays: 6, pricePerPerson: 12499, totalSeats: 32, busType: 'luxury',
    startDate: '2026-09-10', endDate: '2026-09-15',
    imageUrl: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=60',
    description: 'Dal Lake mein shikara ride, Gulmarg ki gondola aur Pahalgam ki vaadiyan — dharti ka swarg apni aankhon se dekho. Houseboat stay included!',
    amenities: ['AC', 'WiFi', 'Recliner Seats', 'Blanket', 'Heater'],
    includedMeals: ['Breakfast', 'Dinner'],
    stops: [
      { place: 'Patnitop', day: '1', arrivalTime: '3:00 PM' },
      { place: 'Srinagar (Dal Lake)', day: '2', arrivalTime: '11:00 AM' },
      { place: 'Gulmarg', day: '4', arrivalTime: '9:00 AM' },
      { place: 'Pahalgam', day: '5', arrivalTime: '10:00 AM' },
    ],
    foodMenu: [
      { name: 'Kashmiri Kahwa + Bakarkhani', meal: 'breakfast', price: 90, isVeg: true },
      { name: 'Rogan Josh + Rice', meal: 'dinner', price: 260, isVeg: false },
      { name: 'Dum Aloo + Naan', meal: 'dinner', price: 170, isVeg: true },
    ],
  },
]

export const seedDemoTours = async () => {
  for (const tour of DEMO_TOURS) {
    await createTour({ ...tour, bus: { type: tour.busType, amenities: tour.amenities } })
  }
  return DEMO_TOURS.length
}
