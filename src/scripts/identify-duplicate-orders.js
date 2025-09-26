// Identify duplicate orders in Firestore
const path = require('path');

// Add the src directory to the module path
const srcPath = path.join(__dirname, '..');
require('module').globalPaths.push(srcPath);

// Import Firebase and Firestore functions
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

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

async function identifyDuplicateOrders() {
  try {
    console.log('🔍 Identifying duplicate orders...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all orders
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderNumber: data.orderNumber || '',
        orderDate: data.orderDate || '',
        customer: data.customer || {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          specialInstructions: '',
        },
        items: data.items || [],
        subtotal: data.subtotal || 0,
        shipping: data.shipping || 0,
        total: data.total || 0,
        emailSent: data.emailSent || false,
        status: data.status || 'pending',
        paymentId: data.paymentId || '',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    });
    
    console.log(`📊 Total orders found: ${orders.length}`);
    
    // Group orders by similar characteristics that might indicate duplicates
    const potentialDuplicates = [];
    
    for (let i = 0; i < orders.length; i++) {
      for (let j = i + 1; j < orders.length; j++) {
        const order1 = orders[i];
        const order2 = orders[j];
        
        // Check for potential duplicates based on:
        // 1. Same customer email and similar timestamp (within 5 minutes)
        // 2. Same total amount and similar timestamp
        // 3. Empty items array (fake orders)
        
        const timeDiff = Math.abs(new Date(order1.createdAt) - new Date(order2.createdAt)) / (1000 * 60); // minutes
        
        if (
          (order1.customer.email === order2.customer.email && timeDiff < 5) ||
          (order1.total === order2.total && timeDiff < 5) ||
          (order1.items.length === 0 || order2.items.length === 0)
        ) {
          potentialDuplicates.push({
            order1: {
              id: order1.id,
              orderNumber: order1.orderNumber,
              customer: order1.customer.email,
              items: order1.items.length,
              total: order1.total,
              createdAt: order1.createdAt,
              status: order1.status
            },
            order2: {
              id: order2.id,
              orderNumber: order2.orderNumber,
              customer: order2.customer.email,
              items: order2.items.length,
              total: order2.total,
              createdAt: order2.createdAt,
              status: order2.status
            },
            timeDiff: timeDiff,
            reason: order1.items.length === 0 || order2.items.length === 0 ? 'Empty items' : 'Similar timestamp and data'
          });
        }
      }
    }
    
    console.log(`\n🔍 Found ${potentialDuplicates.length} potential duplicate pairs:`);
    
    potentialDuplicates.forEach((dup, index) => {
      console.log(`\n${index + 1}. Potential Duplicate Pair:`);
      console.log(`   Order 1: ${dup.order1.orderNumber} (${dup.order1.items} items, £${dup.order1.total})`);
      console.log(`   Order 2: ${dup.order2.orderNumber} (${dup.order2.items} items, £${dup.order2.total})`);
      console.log(`   Time diff: ${dup.timeDiff.toFixed(2)} minutes`);
      console.log(`   Reason: ${dup.reason}`);
    });
    
    // Identify orders with empty items (fake orders)
    const fakeOrders = orders.filter(order => order.items.length === 0);
    console.log(`\n🚫 Orders with empty items (fake orders): ${fakeOrders.length}`);
    fakeOrders.forEach(order => {
      console.log(`   - ${order.orderNumber} (${order.customer.email}) - ${order.createdAt}`);
    });
    
    // Identify orders with empty customer info
    const emptyCustomerOrders = orders.filter(order => 
      !order.customer.email || 
      !order.customer.firstName || 
      !order.customer.lastName
    );
    console.log(`\n🚫 Orders with empty customer info: ${emptyCustomerOrders.length}`);
    emptyCustomerOrders.forEach(order => {
      console.log(`   - ${order.orderNumber} (${order.customer.email || 'no email'}) - ${order.createdAt}`);
    });
    
    // Show recent orders
    console.log(`\n📅 Recent orders (last 10):`);
    orders.slice(0, 10).forEach(order => {
      console.log(`   - ${order.orderNumber} (${order.items.length} items, £${order.total}) - ${order.customer.email} - ${order.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error identifying duplicate orders:', error);
    console.log('\nPossible issues:');
    console.log('1. Check your Firebase environment variables');
    console.log('2. Ensure your Firebase project has Firestore enabled');
    console.log('3. Verify your Firebase security rules allow read access');
  }
}

// Run the script
identifyDuplicateOrders();
