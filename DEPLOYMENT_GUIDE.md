# Deployment Guide: Migrating to Firestore

## Problem
Your admin dashboard works locally but not on Vercel because it uses file-based storage (`data/orders.json`), which doesn't work on serverless platforms.

## Solution
We've migrated your orders to use Firebase Firestore instead of local files.

## Steps to Deploy

### 1. Test Firestore Connection Locally
First, make sure your Firebase configuration is working:

```bash
# Install dependencies if needed
npm install

# Test Firestore connection
node src/scripts/test-firestore.js
```

### 2. Migrate Existing Orders (Optional)
If you want to keep your existing orders:

```bash
# Migrate orders from JSON to Firestore
node src/scripts/migrate-orders-to-firestore.js
```

### 3. Update Vercel Environment Variables

Go to your Vercel dashboard and add these environment variables:

#### Required Firebase Variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA6FJR-AWNgjnsW2_oNCzsmku_L-SPJfjg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=glamourlocks-boutique.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=glamourlocks-boutique
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=glamourlocks-boutique.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=421069906534
NEXT_PUBLIC_FIREBASE_APP_ID=1:421069906534:web:368a0b7f7131e3c7fbc3a7
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6V06JT1EJT
```

#### Admin Authentication:
```
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD_HASH=your-hashed-password-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### Other Required Variables:
```
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Using Git (Recommended)
```bash
# Commit your changes
git add .
git commit -m "Migrate to Firestore for production compatibility"

# Push to your repository
git push origin main
```

Vercel will automatically deploy when you push to your main branch.

### 5. Verify Deployment

After deployment:
1. Visit your admin dashboard: `https://your-domain.vercel.app/admin/dashboard`
2. Try to view, update, and delete orders
3. Check that all functionality works as expected

## What Changed

1. **Database Layer**: Switched from file-based storage to Firebase Firestore
2. **API Routes**: Updated to use Firestore instead of local JSON files
3. **Admin Dashboard**: Now works with persistent cloud storage

## Benefits

✅ **Works on Vercel**: No more file system issues  
✅ **Persistent Data**: Orders survive deployments  
✅ **Real-time Updates**: Firestore provides real-time capabilities  
✅ **Scalable**: Can handle more orders without performance issues  

## Troubleshooting

### If orders don't appear:
1. Check Firebase console to ensure orders were migrated
2. Verify environment variables are set correctly
3. Check browser console for errors

### If admin login doesn't work:
1. Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` are set
2. Check `NEXTAUTH_SECRET` is configured
3. Ensure `NEXTAUTH_URL` matches your domain

### If you get Firebase errors:
1. Check Firebase project settings
2. Verify Firestore is enabled in your Firebase project
3. Check Firebase security rules allow read/write access

## Security Rules for Firestore

Make sure your Firestore security rules allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set in Vercel
3. Test the Firestore connection locally first
4. Check Firebase console for any permission issues 