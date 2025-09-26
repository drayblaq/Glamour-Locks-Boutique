# Firebase Integration Setup Guide

This guide explains how to set up and use the Firebase Firestore integration for the Glamour Locks Boutique website.

## 🚀 What's Been Implemented

### 1. Firebase Configuration
- **File**: `src/lib/firebase.ts`
- Firebase app initialization with your provided config
- Firestore database connection
- Analytics setup (browser-only)

### 2. Firestore Services
- **Products Service**: `src/lib/firestore/products.ts`
  - CRUD operations for products
  - Search and filtering functions
  - Stock management utilities

- **Orders Service**: `src/lib/firestore/orders.ts`
  - Order management with full CRUD
  - Order statistics and reporting
  - Customer order history

### 3. New Product Store
- **File**: `src/lib/store/firestoreProductStore.ts`
- Replaces the old Zustand store
- Real-time Firestore integration
- Loading states and error handling

### 4. Updated Components
- Admin dashboard products page
- Add/Edit product forms
- Main products listing page
- Product cards and lists
- Stripe webhook integration

## 📋 Setup Instructions

### 1. Environment Variables
Make sure these are set in your `.env.local`:

```bash
# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA6FJR-AWNgjnsW2_oNCzsmku_L-SPJfjg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=glamourlocks-boutique.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=glamourlocks-boutique
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=glamourlocks-boutique.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=421069906534
NEXT_PUBLIC_FIREBASE_APP_ID=1:421069906534:web:368a0b7f7131e3c7fbc3a7
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6V06JT1EJT

# Other required variables
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
ADMIN_EMAIL=your_admin_email@example.com
```

### 2. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `glamourlocks-boutique`
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create Database"
   - Choose "Start in test mode" (for development)
   - Select a location (choose closest to your users)

4. Set up Security Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read access to products for all users
       match /products/{productId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       
       // Allow read/write access to orders for authenticated users
       match /orders/{orderId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### 3. Data Migration

Run the migration script to move existing products to Firestore:

```bash
node src/scripts/migrate-to-firestore.js
```

This will:
- Read products from `src/data/products.ts`
- Convert them to Firestore format
- Add them to your Firestore database
- Show migration progress and results

### 4. Testing the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test the admin dashboard**:
   - Go to `/admin/dashboard/products`
   - Try adding, editing, and deleting products
   - Check that changes persist in Firestore

3. **Test the main products page**:
   - Go to `/products`
   - Verify products load from Firestore
   - Test search and filtering

4. **Test order creation**:
   - Make a test purchase
   - Check that orders are saved to Firestore
   - Verify email notifications work

## 🔧 Key Features

### Product Management
- ✅ Real-time product CRUD operations
- ✅ Image URL management
- ✅ Stock tracking
- ✅ Search and filtering
- ✅ Admin dashboard integration

### Order Management
- ✅ Order creation via Stripe webhooks
- ✅ Order status tracking
- ✅ Customer information storage
- ✅ Email notifications
- ✅ Order statistics

### Error Handling
- ✅ Loading states
- ✅ Error messages
- ✅ Retry mechanisms
- ✅ Graceful fallbacks

## 🚨 Important Notes

### 1. Data Structure Changes
- Products now have `createdAt` and `updatedAt` timestamps
- All numeric fields are properly typed
- Images are stored as URL arrays

### 2. Performance Considerations
- Products are cached in the store for better performance
- Real-time updates when data changes
- Optimistic updates for better UX

### 3. Security
- Firestore rules protect your data
- Admin functions require authentication
- Public read access for products only

### 4. Migration Safety
- The migration script is safe to run multiple times
- Existing data won't be duplicated
- Backup your data before migration

## 🐛 Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**
   - Check that Firebase config is correct
   - Verify environment variables are set

2. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure authentication is working

3. **Products not loading**
   - Check browser console for errors
   - Verify Firestore connection
   - Check if data was migrated successfully

4. **Migration script fails**
   - Ensure Node.js is installed
   - Check Firebase credentials
   - Verify products.ts file exists

### Debug Commands

```bash
# Check Firebase connection
node -e "const { initializeApp } = require('firebase/app'); const app = initializeApp({...}); console.log('Firebase initialized successfully')"

# Test Firestore access
node src/scripts/test-firestore.js

# View current products
node src/scripts/list-products.js
```

## 📈 Next Steps

1. **Production Deployment**
   - Update Firestore security rules for production
   - Set up proper authentication
   - Configure backup strategies

2. **Advanced Features**
   - Real-time inventory updates
   - Advanced analytics
   - Customer reviews system
   - Automated email campaigns

3. **Performance Optimization**
   - Implement pagination for large datasets
   - Add caching layers
   - Optimize queries

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase console for database activity
3. Test with the provided scripts
4. Review this documentation

The integration is now complete and ready for use! 🎉 