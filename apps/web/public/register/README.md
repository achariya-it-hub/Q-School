# BMIT Registration Form – Setup

1. Create a new Google Sheet at https://sheets.new (name it "Q-School BMIT Registrations").
2. Go to **Extensions → Apps Script**, paste the contents of `apps-script.gs`, and save.
3. Click **Deploy → New deployment → Web app**. Set *Execute as*: Me, and *Who has access*: Anyone. Deploy and copy the Web App URL.
4. Paste that URL into `SCRIPT_URL` in `index.html`.
5. Open `index.html` (or host it on any static host). Submissions appear in the sheet.
6. Share the sheet using **Share** in Google Sheets.
