import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Assumes GOOGLE_APPLICATION_CREDENTIALS environment variable is set or runs on GCP
// For local testing, we can use the default app if no service account is provided
try {
  admin.initializeApp({
    projectId: 'dfns-mpc-hedera',
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  if (!/already exists/.test((error as Error).message)) {
    console.error('Firebase admin initialization error', error);
  }
}

export { admin };
