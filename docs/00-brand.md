# 00 · Q-School Brand Kit

> **Q-School — Quantum Schooling.** All platform docs, apps and flows use this name and these tokens.

## Identity

| Item | Value |
|---|---|
| Name | Q-School (written "Q-School"; logo lockup reads "Q SCHOOL") |
| Tagline | Quantum Schooling |
| Logo files | `brand/logo-full.png` (1600w master copy) · `brand/logo-mark-preview.png` (wordmark) · `brand/logo-icon-preview.png` (icon/mark) |
| Original assets | Designer package: AI master + PDF + JPG/PNG (kept outside repo; do not commit the 16k-px masters) |
| Wordmark font | **Roundkey Soft Bold** (OTF in designer package — license check before web embedding; otherwise use closest Google Font) |
| Body font | **Poppins** (Regular provided in package; Google Fonts available — safe for web/app) |

## Colors (extracted from final logo PNG — use these exact values)

| Token | Hex | Usage |
|---|---|---|
| `--qs-deep` | `#054038` | Primary brand color — headers, sidebar, wordmark, buttons |
| `--qs-teal` | `#0E937E` | Accent — CTAs, highlights, active states, brain mark |
| `--qs-ink` | `#010D0B` | Tagline text, near-black text on light surfaces |
| Surface light | `#FFFFFF` | Cards on light theme |
| Tint | `#0E937E14` (teal @ 8%) | Section backgrounds, hovers |

Suggested scale (derive with Tailwind): teal-900 `#054038`, teal-700 `#0E937E`, teal-500 `#2BB39C`, teal-100 `#D7F0EB`, ink `#010D0B`.

## Theme mapping (Tailwind / shadcn tokens)

```css
:root {
  --primary: #054038;        /* deep pine — primary actions, sidebar */
  --primary-foreground: #FFFFFF;
  --accent: #0E937E;         /* teal — links, highlights, charts */
  --ring: #0E937E;
  --background: #FFFFFF;
  --foreground: #010D0B;
  --muted: #F0F7F5;          /* faint teal-grey */
  --border: #E2ECE9;
}
.dark {
  --background: #04211C;     /* deep teal-black */
  --foreground: #E6F2EF;
  --primary: #0E937E;
  --accent: #2BB39C;
}
```

Tailwind config alias: `brand: { deep: '#054038', teal: '#0E937E', teal500: '#2BB39C', teal100: '#D7F0EB', ink: '#010D0B' }`.

## Usage rules

- **Contrast:** white text on `#054038` and `#0E937E` passes AA for large text; for small body text on teal use `#054038` surface instead.
- **Charts (Metabase/admin):** series order teal `#0E937E` → deep `#054038` → `#2BB39C` → amber `#F4B740` (alert) → grey.
- **Emails/invoices:** deep header bar `#054038`, teal accent buttons.
- **Mobile app:** splash = white/deep-teal background with icon mark; status bar `#054038`.
- **Do not:** recolor the brain mark, stretch the lockup, or put the teal mark on low-contrast backgrounds.

## Product naming (use consistently)

| Surface | Name |
|---|---|
| Marketing site | qschool.com (placeholder) — "Q-School" |
| Learner web app | Q-School Learn |
| Admin/CRM/ERP | Q-School Console |
| Mobile app | Q-School (App Store / Play listing) |
| Live classroom | Q-School Live (powered by BigBlueButton) |
