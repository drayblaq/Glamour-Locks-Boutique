const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

// Firebase config - you'll need to replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  // This should match your existing Firebase configuration
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultShippingOptions = [
  {
    name: 'Standard Shipping',
    description: 'Regular delivery service with tracking',
    price: 2.49,
    estimatedDays: { min: 3, max: 5 },
    isActive: true,
  },
  {
    name: 'Express Shipping',
    description: 'Faster delivery for urgent orders',
    price: 9.99,
    estimatedDays: { min: 1, max: 2 },
    isActive: true,
  },
  {
    name: 'Next Day Delivery',
    description: 'Get your order tomorrow (order before 2 PM)',
    price: 7.55,
    estimatedDays: { min: 1, max: 1 },
    isActive: true,
  },
  {
    name: 'Free Shipping',
    description: 'Free standard delivery (orders over £50)',
    price: 0,
    estimatedDays: { min: 5, max: 7 },
    isActive: true,
  },
];

async function seedShippingOptions() {
  try {
    console.log('🚀 Starting to seed shipping options...');

    // Check if shipping options already exist
    const existingOptions = await getDocs(collection(db, 'shippingOptions'));
    
    if (existingOptions.size > 0) {
      console.log('⚠️  Shipping options already exist. Skipping seed.');
      return;
    }

    // Add each shipping option
    for (const option of defaultShippingOptions) {
      const docRef = await addDoc(collection(db, 'shippingOptions'), {
        ...option,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Added shipping option: ${option.name} (ID: ${docRef.id})`);
    }

    console.log('🎉 Successfully seeded shipping options!');
  } catch (error) {
    console.error('❌ Error seeding shipping options:', error);
  }
}

