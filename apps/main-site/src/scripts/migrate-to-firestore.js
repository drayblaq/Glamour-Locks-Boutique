const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6FJR-AWNgjnsW2_oNCzsmku_L-SPJfjg",
  authDomain: "glamourlocks-boutique.firebaseapp.com",
  projectId: "glamourlocks-boutique",
  storageBucket: "glamourlocks-boutique.firebasestorage.app",
  messagingSenderId: "421069906534",
  appId: "1:421069906534:web:368a0b7f7131e3c7fbc3a7",
  measurementId: "G-6V06JT1EJT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Read existing product data
const productsPath = path.join(__dirname, '../data/products.ts');
const productsContent = fs.readFileSync(productsPath, 'utf8');

// Extract product data from the TypeScript file
const productMatches = productsContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!productMatches) {
  console.error('Could not find products array in products.ts');
  process.exit(1);
}

// Parse the products array (this is a simplified parser)
const productsString = productMatches[1];
const products = eval(productsString.replace(/Product\[\]/g, '[]'));

console.log(`Found ${products.length} products to migrate`);

async function migrateProducts() {
  const productsRef = collection(db, 'products');
  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      // Convert to Firestore format
      const firestoreProduct = {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        images: Array.isArray(product.images) ? product.images : [],
        stock: Number(product.stock) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(productsRef, firestoreProduct);
      console.log(`✅ Migrated: ${product.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate ${product.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`✅ Successfully migrated: ${successCount} products`);
  console.log(`❌ Failed to migrate: ${errorCount} products`);
  console.log(`📊 Total processed: ${products.length} products`);
}

// Run migration
migrateProducts().catch(console.error); 