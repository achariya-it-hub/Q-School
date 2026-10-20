# Q-School Admission Form – Setup & Sharing

## 1. Connect the Google Sheet (one time)
1. Create a Google Sheet (e.g. "Q-School Admissions") at https://sheets.new.
2. **Extensions → Apps Script** → delete any code → paste `apps-script.gs` → Save.
3. Click **Run** once (choose `doGet`) and approve the permissions (Sheets + Drive, needed for photos).
4. **Deploy → New deployment → ⚙ Web app** → Execute as **Me**, Access **Anyone** → Deploy.
5. Copy the Web App URL (ends in `/exec`) and open it in a browser. It should say "Q-School admission endpoint is live."
6. Paste the URL into `SCRIPT_URL` in `index.html`.

Each submission adds a row in the **Admissions** tab. Student photos are saved in the Google Drive folder **Q-School Admission Photos**, and the row has a link to each photo.

## 2. Publish the form
Upload `index.html`, `logo.png` and `logo-mark.png` to a folder on your server (e.g. `yoursite.com/admission/`).
Shareable link: `https://yoursite.com/admission/`

## 3. Sales-person tracking for events
Add `?sp=NAME` to the link, one per sales person:
- `https://yoursite.com/admission/?sp=Ravi`
- `https://yoursite.com/admission/?sp=Priya`

The name appears in the **Shared By (Sales)** column. Turn any link into a QR code (e.g. at qr-code-generator.com) and print it for events.
