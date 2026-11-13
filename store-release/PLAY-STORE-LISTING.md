# Q-School — Google Play Console & App Store Upload Package

**Organization:** Q-School - A Unit of Divine Grace Foundation  
**Package Name / Application ID:** `com.qschool.qschool`  
**Version:** `1.0.0` (`versionCode: 2`)  
**Website:** https://www.theqschool.com  
**Privacy Policy URL:** https://www.theqschool.com/privacy-policy  
**Refund Policy URL:** https://www.theqschool.com/refund-policy  

---

## 1. Uploadable App Bundles & Binaries (`store-release/bundles/`)

| File | Purpose | Where to Upload |
|------|---------|-----------------|
| `qschool-release.aab` | **Signed Android App Bundle (`.aab`)** | Google Play Console → **Production / Internal Testing → App bundles** |
| `qschool-release.apk` | **Signed Universal Release APK (`.apk`)** | Direct installation / WhatsApp / Website download |
| `upload-keystore.jks` | **Android Upload Keystore** (RSA 2048-bit, 10,000-day validity) | Keep safe for all future Play Store updates |

### Keystore Credentials & Certificate Fingerprints
- **Keystore File:** `store-release/bundles/upload-keystore.jks` (also in `apps/flutter/android/app/upload-keystore.jks`)
- **Key Alias:** `upload`
- **Store Password:** `qschool2026`
- **Key Password:** `qschool2026`
- **Validity:** Until March 31, 2054 (10,000 days)
- **SHA-1 Fingerprint:** `EC:7B:66:3D:A3:25:8C:1F:29:B2:8A:C8:BC:99:C2:1D:B8:6E:01:1A`
- **SHA-256 Fingerprint:** `00:85:26:BC:5C:C3:50:04:05:E9:5F:A8:7E:6F:16:FD:3F:66:56:04:F4:4B:21:3F:69:3A:14:1F:72:A7:C2:FC`
- **Distinguished Name (DN):** `CN=Q-School, OU=Divine Grace Foundation, O=Q-School, L=Puducherry, ST=Puducherry, C=IN`

---

## 2. Store Graphics & Icons

### App Icons (`store-release/icons/`)
- **`app-icon-512x512.png`** — **512 × 512 px** (32-bit PNG) → Upload to **Google Play Console → Main store listing → App icon**
- **`app-icon-1024x1024.png`** — **1024 × 1024 px** (24-bit RGB PNG, no alpha) → Upload to **Apple App Store Connect**
- **`adaptive-foreground-432x432.png`** & **`adaptive-background-432x432.png`** — Android Adaptive Icon layers
- **`android-mipmaps/`** — Pre-scaled `mipmap-mdpi` (48px), `mipmap-hdpi` (72px), `mipmap-xhdpi` (96px), `mipmap-xxhdpi` (144px), `mipmap-xxxhdpi` (192px) launcher icons (already embedded inside the `.aab` and `.apk`)

### Feature Graphic & Banner (`store-release/graphics/`)
- **`feature-graphic-1024x500.png`** — **1024 × 500 px** (24-bit PNG) → Upload to **Google Play Console → Main store listing → Feature graphic**
- **`promo-banner-1280x720.png`** — **1280 × 720 px** (24-bit PNG) → Promo / TV banner

### Screenshots (`store-release/screenshots/`)
- **Phone Screenshots (`store-release/screenshots/phone/`, 1080 × 1920 px, 9:16 portrait)**:
  1. `01-whole-brain-learning-hub.png` — Quantum Schooling™ Ecosystem (Neo Sapiens, Q-Verse, Q-Habits, RBIQ)
  2. `02-rbiq-9-skill-activities.png` — RBIQ 9 Skill-Building Brain Activities
  3. `03-six-step-class-methodology.png` — Every Class Follows the Same Six Steps (Engage → Explore → Practise → Apply → Reflect → Reinforce)
  4. `04-q-habits-and-mindfulness.png` — Q-Habits Daily System & Mindfulness
  5. `05-bmit-assessment-analytics.png` — BMIT Brain Mapping & Student Analytics
  6. `06-partner-referral-portal.png` — Q-School Partner Self-Registration & Referral Portal
- **7-inch Tablet Screenshots (`store-release/screenshots/tablet-7inch/`, 1920 × 1200 px, 16:10)**:
  1. `01-tablet-quantum-learning-hub.png`
  2. `02-tablet-partner-and-progress-portal.png`
- **10-inch Tablet Screenshots (`store-release/screenshots/tablet-10inch/`, 1920 × 1200 px, 16:10)**:
  1. `01-tablet-quantum-learning-hub.png`
  2. `02-tablet-partner-and-progress-portal.png`

---

## 3. Ready-to-Paste Store Listing Copy

### App Name (Max 30 characters)
```text
Q-School: Quantum Schooling
```

### Short Description (Max 80 characters)
```text
Whole Brain Development, Neo Sapiens, Q-Verse, Q-Habits, RBIQ & Partner Portal.
```

### Full Description (Max 4000 characters)
```text
Unlock Potential. Engineer Brilliance.

Q-School (A Unit of Divine Grace Foundation) brings the Quantum Schooling™ ecosystem to students, parents, educators, and referral partners. Designed for children aged 6–16, Q-School blends ancient mindfulness wisdom, modern neuroscience, and experiential skill-building to strengthen cognitive development, concentration, coordination, memory, and problem-solving abilities.

KEY PROGRAMS IN THE Q-SCHOOL APP

1. RBIQ – Whole Brain Development Program
9 structured skill-building activities engineered for bilateral brain activation:
• Cup Stacking – Hand-eye coordination, focus, speed, and accuracy
• Rubik's Cube Solving – Logical thinking, pattern recognition, and problem-solving
• Clairaudience (Auditory Awareness) – Listening skills, sound recognition, and auditory attention
• Parallel Processing – Mental flexibility, attention, and information processing
• Rope Knot – Spatial reasoning, fine motor skills, and sequential thinking
• Towel Folding – Visual-spatial awareness, precision, and organisation
• Abacus – Number sense, visualisation, and mental calculation skills
• Speed Reading – Reading fluency, visual tracking, and comprehension
• Ambidexterity – Bilateral coordination, motor control, and hand flexibility

2. Neo Sapiens
Future-ready intelligence curriculum cultivating scientific curiosity, critical reasoning, communication mastery, and real-world problem solving.

3. Q-Verse
Interactive learning cohorts, live mentor sessions, and guided practice following Q-School's signature 6-Step Class Cycle:
Engage → Explore → Practise → Apply → Reflect → Reinforce.

4. Q-Habits
21-day habit streaks, morning alpha-focus routines, mindfulness practice, and evening reflection journals that build character and self-discipline at home.

5. Brain Mapping & Intelligence Test (BMIT)
Comprehensive cognitive profiling and learning-style insights to personalize every child's growth roadmap.

6. Q-School Partner & Referral Portal
• Instant Partner Self-Registration in the mobile app with automatic QSP Partner Code generation
• One-tap referral sharing via WhatsApp & QR code
• Real-time lead status tracking from enquiry to admission
• Transparent commission ledger and payout tracking

GOVERNANCE & ROLE SECURITY
• Partners can self-register directly in the app and are securely locked to the Partner Portal.
• Student and Teacher/Faculty accounts are verified and approved by Q-School Administration to protect student privacy and classroom integrity.

Learn more at https://www.theqschool.com
© 2026 Q-School - A Unit of Divine Grace Foundation
```

### Release Notes (What's New in v1.0.0)
```text
• Official launch of Q-School: Quantum Schooling (v1.0.0)
• Added RBIQ Whole Brain Development (9 Skill-Building Activities), Neo Sapiens, Q-Verse & Q-Habits modules
• Added Partner self-registration & live referral tracking portal
• Enforced Admin approval for Student & Faculty logins and strict Partner role isolation
```

---

## 4. Google Play Console Declarations Quick Reference

- **App Category:** Education
- **Tags:** Education, Brain Training, Parent & Child, Early Education
- **Contact Email:** `info@theqschool.com`
- **Contact Website:** `https://www.theqschool.com`
- **Privacy Policy URL:** `https://www.theqschool.com/privacy-policy`
- **App Access (Demo Sign-In for Google Play Reviewers):**
  - **Instruction Name:** `Student Demo Sign-In (Primary)`
  - **Username / Email:** `student@theqschool.com`
  - **Password:** `qschool2026`
  - **Additional Reviewer Notes:**
    ```text
    1. Student Mode (Default tab on login screen):
       • Email: student@theqschool.com
       • Password: qschool2026

    2. Teacher Mode (Select "Teacher" tab on login screen):
       • Email: teacher@theqschool.com
       • Password: qschool2026

    3. Partner Mode (Select "Partner" tab on login screen):
       • Partner Referral Code: QSP-DEMO
       • (Or tap "Sign Up as Partner" to self-register a new Partner account immediately; no OTP or payment required.)
    ```

