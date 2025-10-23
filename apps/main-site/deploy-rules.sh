#!/bin/bash

echo "🔥 Deploying Firebase Firestore Rules..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Deploy only the firestore rules
firebase deploy --only firestore:rules

echo "✅ Firebase rules deployed successfully!"
echo "🔧 Customer authentication should now work properly."







