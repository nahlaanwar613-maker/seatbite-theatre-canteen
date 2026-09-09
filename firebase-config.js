// Copy your Firebase Web App configuration into this file.
// This config is intended for a browser app. Do NOT put Firebase Admin/service-account
// credentials here.
//
// Firebase Console steps are documented in README.md.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const firebaseConfigured =
  !firebaseConfig.apiKey.startsWith("YOUR_") &&
  !firebaseConfig.projectId.startsWith("YOUR_") &&
  !firebaseConfig.appId.startsWith("YOUR_");
