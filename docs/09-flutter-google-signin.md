# Google / Gmail Sign-In Setup (Flutter Mobile App)

Gmail Sign-In (`google_sign_in`) is wired across all authentication screens in `apps/flutter` (`LoginScreen`, `SignupScreen`, and `PartnerLoginScreen`) and verified server-side via `POST /api/mobile/auth/google` on `https://erp.theqschool.com`.

To enable the native Google Account Picker on physical Android/iOS devices and Web, register your app's OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (or Firebase Console):

---

## 1. Android (`com.qschool.qschool`)

1. Generate your debug keystore **SHA-1** fingerprint on your PC:
   ```powershell
   cd "e:\Q-School LMS\apps\flutter\android"
   .\gradlew signingReport
   ```
   *(Or via `keytool`: `keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android`)*
2. In **Google Cloud Console → APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - **Application type:** Android
   - **Package name:** `com.qschool.qschool`
   - **SHA-1 certificate fingerprint:** Paste the SHA-1 from step 1 (add your Play Store release keystore SHA-1 too before publishing).
3. Also create a **Web application** OAuth Client ID (used to issue `idToken` for backend verification on `erp.theqschool.com`), and pass it when building if needed:
   ```powershell
   flutter run --dart-define=GOOGLE_SERVER_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
   ```
   *(Alternatively, if using Firebase Auth/Analytics, drop `google-services.json` into `apps/flutter/android/app/google-services.json`.)*

---

## 2. iOS (`com.qschool.qschool`)

1. In Google Cloud Console, create an **iOS** OAuth Client ID for bundle ID `com.qschool.qschool`.
2. Open `apps/flutter/ios/Runner/Info.plist` and replace:
   - `YOUR_IOS_CLIENT_ID.apps.googleusercontent.com` under `GIDClientID`
   - `com.googleusercontent.apps.YOUR_IOS_CLIENT_ID` under `CFBundleURLSchemes`

---

## 3. Flutter Web (`localhost:8100`)

1. Add `http://localhost:8100` under **Authorized JavaScript origins** on your Web OAuth 2.0 Client ID.
2. Put that Client ID in `apps/flutter/web/index.html` (`<meta name="google-signin-client_id" content="...">`) or pass:
   ```powershell
   flutter run -d chrome --web-port 8100 --dart-define=GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
   ```
