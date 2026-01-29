const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Initialize Firebase Admin SDK
 * Loads service account credentials from JSON file
 */
const initializeFirebase = () => {
  try {
    // Determine service account path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
      ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : path.join(__dirname, '../../firebase-service-account.json');

    // Check if service account file exists
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`❌ Firebase service account file not found at: ${serviceAccountPath}`);
      console.error('📝 Please create firebase-service-account.json from Firebase Console');
      console.error('   Go to: Project Settings > Service Accounts > Generate New Private Key');
      process.exit(1);
    }

    // Load service account
    const serviceAccount = require(serviceAccountPath);

    // Initialize Firebase Admin only if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized');
    }

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
