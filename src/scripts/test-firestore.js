// Test Firestore connection
const path = require('path');

// Add the src directory to the module path
const srcPath = path.join(__dirname, '..');
require('module').globalPaths.push(srcPath);

// Import Firebase and Firestore functions
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } = require('firebase/firestore');

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

async function testFirestore() {
  try {
    console.log('Testing Firestore connection...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Test reading orders
    console.log('Testing getOrders...');
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    console.log(`✅ Successfully read ${querySnapshot.size} orders from Firestore`);
    
    // Test adding a test order
    console.log('Testing addOrder...');
    const testOrder = {
      orderNumber: `TEST-${Date.now()}`,
      orderDate: new Date().toISOString(),
      customer: {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country',
        specialInstructions: 'Test order for migration verification'
      },
      items: [
        {
          id: 'test-item',
          name: 'Test Product',
          price: 10.00,
          image: 'https://example.com/test.jpg',
          description: 'Test product for migration',
          quantity: 1
        }
      ],
      subtotal: 10.00,
      shipping: 0,
      total: 10.00,
      emailSent: false,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'orders'), testOrder);
    console.log(`✅ Successfully added test order with ID: ${docRef.id}`);
    
    // Clean up test order
    console.log('Cleaning up test order...');
    await deleteDoc(doc(db, 'orders', docRef.id));
    console.log('✅ Test order cleaned up');
    
    console.log('\n🎉 Firestore connection test successful!');
    console.log('Your Firebase configuration is working correctly.');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    console.log('\nPossible issues:');
    console.log('1. Check your Firebase environment variables');
    console.log('2. Ensure your Firebase project has Firestore enabled');
    console.log('3. Verify your Firebase security rules allow read/write');
    console.log('4. Make sure you have the required environment variables set');
  }
}

testFirestore(); 