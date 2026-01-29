const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Initialize Firebase Admin SDK
 * 
 * Supports two modes:
 * 1. Environment variables (for Vercel/serverless) - FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * 2. JSON file (for local development) - firebase-service-account.json
 */
const initializeFirebase = () => {
  try {
    // Skip if already initialized
    if (admin.apps.length) {
      return admin;
    }

    // Check for environment variable credentials (Vercel deployment)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle escaped newlines in environment variable
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ Firebase Admin SDK initialized (from environment variables)');
      return admin;
    }

    // Fallback to JSON file (local development)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
      ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : path.join(__dirname, '../../firebase-service-account.json');

    // Check if service account file exists
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`❌ Firebase service account file not found at: ${serviceAccountPath}`);
      console.error('📝 Either set environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
      console.error('   Or create firebase-service-account.json from Firebase Console');
      console.error('   Go to: Project Settings > Service Accounts > Generate New Private Key');
      process.exit(1);
    }

    // Load service account from file
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin SDK initialized (from JSON file)');

    return admin;
  } catch (error) {
    console.error(`❌ Firebase initialization failed: ${error.message}`);
    process.exit(1);
  }
};

// Initialize and export
initializeFirebase();

module.exports = {
  admin,
  auth: admin.auth()
};
