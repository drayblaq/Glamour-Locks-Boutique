// Simple Firebase connection test
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function testConnection() {
  try {
    console.log('Testing Firebase connection...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Try to read from orders collection
    console.log('Testing Firestore read...');
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    console.log(`✅ Successfully connected to Firestore`);
    console.log(`Found ${querySnapshot.size} orders in the database`);
    
    console.log('\n🎉 Firebase connection test successful!');
    console.log('Your Firebase configuration is working correctly.');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Check your Firebase project ID');
    console.log('2. Ensure Firestore is enabled in your Firebase project');
    console.log('3. Check Firebase security rules');
    console.log('4. Verify your Firebase project exists and is accessible');
  }
}

testConnection(); 