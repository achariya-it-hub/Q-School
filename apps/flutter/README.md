# Q-School — Flutter app (iOS & Android)

Student mobile app built in Flutter. Same screens, design and demo data as the mockups.

## First-time setup

The repo holds the Dart source only. Generate the native iOS/Android folders once with `flutter create`,
which keeps every file already here:

```bash
cd apps/flutter
flutter create . --org com.qschool --project-name qschool --platforms android,ios
flutter pub get
flutter run            # pick an Android emulator / iPhone simulator / connected phone
```

iOS builds need a Mac with Xcode. Android works on Windows/macOS/Linux with Android Studio.

The app uses only the Flutter SDK and Material icons, with no third-party packages.

## Screens

| Route | File | Screen |
|---|---|---|
| `/` | `lib/screens/welcome.dart` | Welcome / onboarding (3 slides) |
| `/login` | `lib/screens/login.dart` | Login / Sign up, social buttons |
| `/app` | `lib/screens/shell.dart` | Bottom tabs: Home · Learn · Explore (centre button) · Community · Profile |
| — | `home.dart`, `learn.dart`, `explore.dart`, `community.dart`, `profile.dart` | Tab screens |
| `/course` (arg: slug) | `lib/screens/course_detail.dart` | Course detail: preview, tabs, what you'll learn, Enroll |
| `/live` | `lib/screens/live_class.dart` | Live class: video stage, chat, raise hand |
| `/workshops` · `/webinars` · `/offline` · `/certificates` | `lib/screens/*.dart` | Hub list screens |

- `lib/theme.dart`: brand colours (`QS.deep`, `QS.teal`, …)
- `lib/widgets/kit.dart`: shared UI (ArtThumb, Avatar, QSPage, Segments, FilterChips, QSButton, PillButton…)
- `lib/data.dart`: demo data (mirrors `packages/shared/src/student.ts`). Replace with API calls later.

Thumbnails are illustrated gradients (`ArtThumb`). Swap in `Image.network` once course media exists.

## Next steps

- App icon & splash: add `flutter_launcher_icons` + `flutter_native_splash` (source: `assets/images/app-icon.png`)
- State & routing: Riverpod + go_router once screens load real data
- API: `dio` against the NestJS backend; auth tokens in `flutter_secure_storage`
- Video: `video_player` (HLS); live classes: `livekit_client`, with BigBlueButton in a webview
- Push: `firebase_messaging` (FCM/APNs); code-push updates: Shorebird
