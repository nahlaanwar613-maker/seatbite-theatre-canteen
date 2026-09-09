# SeatBite — Full Theatre Canteen Application

This version combines the features requested:

- Create Account
- Email/password authentication using Firebase Authentication
- Login using email and password
- Location selection
- Theatres filtered by location
- Movies filtered by theatre
- Show-time selection
- Seat selection
- Canteen menu
- Cart and totals
- UPI / Cash on Delivery selection
- Payment step before placing an order
- My Orders
- Order status timeline
- Profile and logout
- Azure Static Web Apps / GitHub Actions friendly
- Pure HTML/CSS/JavaScript frontend

## 1. Configure Firebase email/password authentication

This project uses Firebase Authentication with email/password sign-in, so it does not require SMS OTP or phone verification.

1. Open Firebase Console: https://console.firebase.google.com/
2. Create a Firebase project.
3. Add a Web App to the project.
4. Go to Authentication → Sign-in method and enable Email/Password.
5. Add your Azure Static Web Apps domain under Authentication → Settings → Authorized domains.
6. Copy the Firebase Web App configuration.
7. Open `firebase-config.js`.
8. Replace the `YOUR_...` values with your project's Web App config.
9. Commit/push the files to GitHub.
10. GitHub Actions will redeploy the Azure Static Web App.

The website uses `createUserWithEmailAndPassword()` for registration and `signInWithEmailAndPassword()` for login. No SMS OTP or reCAPTCHA is used.

## 2. Important payment note

The UPI option in this version is a UI/prototype validation only. It does NOT transfer or verify money.

For real UPI/card payments, add a payment gateway and server-side payment verification before calling an order "paid". Do not trust a payment result generated only in browser JavaScript.

## 3. Orders note

The current prototype stores orders in browser `localStorage`, so it is useful for demonstrating the complete UI flow.

For a production version, move orders to a backend/database such as:
Azure Static Web Apps → Azure Functions/API → database

Then My Orders can load the user's real orders across devices.

## 4. Azure deployment

Keep:
- `index.html`
- `style.css`
- `script.js`
- `firebase-config.js`

at the root of the GitHub repository.

For Azure Static Web Apps:
- App location: `/`
- API location: leave blank
- Output location: `/`

No build step is required.

## 5. Firebase security

The Firebase Web App config is designed to be used by browser applications. Never put Firebase Admin SDK credentials, service-account JSON, private keys, or other server secrets in `firebase-config.js`.

## 6. Sample data

The project includes sample locations:
- Perinthalmanna
- Kozhikode
- Kochi

and sample theatres, movies and show times. Replace these later with real cinema data from a backend/database.

## 7. Recommended next production upgrade

1. Azure Functions API
2. Azure Cosmos DB or Azure SQL
3. Real movie/theatre/show database
4. Seat inventory
5. Real payment gateway
6. Admin dashboard to change order status
7. Push/SMS notification
8. Application Insights monitoring
