import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCi6IrYUlW84Ur0mU3rnTkWk4gc9bItGdc',
  authDomain: 'joyappfull.firebaseapp.com',
  projectId: 'joyappfull',
  storageBucket: 'joyappfull.firebasestorage.app',
  messagingSenderId: '924379831829',
  appId: '1:924379831829:web:ef195e55f01d015802781c',
  measurementId: 'G-CVJSL448SQ',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

