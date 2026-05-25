# 🚌 YatraPro — Firebase Edition

React + Firebase (Auth + Firestore + Hosting) — No backend needed!

## Setup Steps

### 1. Firebase Project banao
1. console.firebase.google.com pe jao
2. "Add project" → "YatraPro"
3. Firestore Database → "Create database" → Production mode
4. Authentication → "Get started" → Enable Email/Password + Google
5. Project Settings → "Add app" → Web → Config copy karo

### 2. .env file banao
```bash
cp .env.example .env
# Firebase config values fill karo
```

### 3. Firestore Rules deploy karo
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 4. App chalao
```bash
npm install
npm run dev
```

### 5. Firebase Hosting pe deploy karo
```bash
npm run build
firebase deploy --only hosting
```

## Admin banane ka tarika
1. Register karo normal user ki tarah
2. Firebase Console → Firestore → users collection
3. Apna document dhundo → role: "customer" → "admin" karo

## File Structure
```
src/
├── firebase/
│   ├── config.js       ← Firebase initialize
│   ├── authService.js  ← Login, Register, Google Auth
│   └── firestore.js    ← All database operations
├── context/
│   └── AuthContext.jsx ← Global auth state
├── pages/              ← All pages
└── components/         ← Navbar, SeatMap
```
