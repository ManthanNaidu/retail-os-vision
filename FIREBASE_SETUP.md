# Firebase Setup for RetailOS

This guide explains how to configure Firebase for the new **Email/Password & Google Sign-In** architecture.

## 1. Firebase Project Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your `retail-os-vision` project.

## 2. Enable Authentication Providers

1. Navigate to **Build > Authentication**.
2. Go to the **Sign-in method** tab.
3. Click **Add new provider**.

### A. Email/Password
1. Select **Email/Password**.
2. Toggle the **Enable** switch.
3. (Optional but recommended) Do not enable "Email link (passwordless sign-in)".
4. Click **Save**.

### B. Google Sign-In
1. Click **Add new provider** again.
2. Select **Google**.
3. Toggle the **Enable** switch.
4. Set the **Project support email** to your email address.
5. Click **Save**.

## 3. Authorized Domains

To allow Google Sign-In to work on your Vercel deployment:
1. On the Authentication > Settings page, click **Authorized domains**.
2. Ensure your Vercel deployment URL (e.g., `vision-eight-woad.vercel.app`) is listed here.
3. Add any custom domains you use.

## 4. Environment Variables

Your `.env.local` (and Vercel Environment Variables) must contain the following keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. Firestore Database

1. Navigate to **Build > Firestore Database**.
2. Ensure your database is initialized.
3. Under the **Rules** tab, update your security rules to ensure users can only read/write their own data. A basic secure rule set looks like this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

*Note: Since we completely removed Phone OTP, you **no longer** need a Blaze plan or a credit card to authenticate users!*
