const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

// Read the existing orders from JSON file
const ordersFile = path.join(process.cwd(), 'data', 'orders.json');

async function migrateOrders() {
  try {
    console.log('Starting migration of orders to Firestore...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Check if orders file exists
    if (!fs.existsSync(ordersFile)) {
      console.log('No orders.json file found. Nothing to migrate.');
      return;
    }

    // Read existing orders
    const ordersData = fs.readFileSync(ordersFile, 'utf-8');
    const orders = JSON.parse(ordersData);
    
    console.log(`Found ${orders.length} orders to migrate`);
    
    if (orders.length === 0) {
      console.log('No orders to migrate.');
      return;
    }

    // Create a backup of the current orders
    const backupFile = path.join(process.cwd(), 'data', `orders.backup.${Date.now()}.json`);
    fs.writeFileSync(backupFile, ordersData);
    console.log(`Backup created: ${backupFile}`);
    
    let migratedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        // Remove the id field as Firestore will generate its own
        const { id, ...orderData } = order;
        
        // Ensure required fields are present
        if (!orderData.orderNumber) {
          orderData.orderNumber = `GLB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        if (!orderData.orderDate) {
          orderData.orderDate = orderData.createdAt || new Date().toISOString();
        }
        
        if (!orderData.status) {
          orderData.status = 'pending';
        }

        // Add Firestore timestamps
        orderData.createdAt = serverTimestamp();
        orderData.updatedAt = serverTimestamp();

        // Add to Firestore
        await addDoc(collection(db, 'orders'), orderData);
        migratedCount++;
        console.log(`Migrated order: ${orderData.orderNumber}`);
      } catch (error) {
        console.error(`Error migrating order ${order.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Successfully migrated: ${migratedCount} orders`);
    console.log(`Errors: ${errorCount} orders`);
    
    if (migratedCount > 0) {
      console.log('\n✅ Migration successful! Your orders are now in Firestore.');
      console.log('You can now safely delete the orders.json file if you want.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateOrders(); 