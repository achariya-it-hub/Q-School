/**
 * Q-School Admission Form – Google Sheet BACKUP copy (the ERP is the main record).
 * Paste into: Google Sheet → Extensions → Apps Script
 * Deploy → New deployment → Web app → Execute as: Me, Access: Anyone
 * First run: approve Sheets + Drive permissions (needed to save student photos).
 * After editing: Deploy → Manage deployments → Edit → New version.
 */
const SHEET_NAME = "Admissions";
const FOLDER_NAME = "Q-School Admission Photos";
const HEADERS = ["Timestamp", "Student Name", "Date of Birth", "Grade", "School", "Centre", "Student Photo",
  "Parent Name", "Phone", "Email", "Address", "Shared By (Sales)", "Aadhaar No"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold").setBackground("#0e937e").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.getRange(1, HEADERS.indexOf("Phone") + 1, sheet.getMaxRows(), 1).setNumberFormat("@"); // phone as text
    sheet.getRange(1, HEADERS.indexOf("Aadhaar No") + 1, sheet.getMaxRows(), 1).setNumberFormat("@"); // keep leading digits
    sheet.getRange("A:A").setNumberFormat("dd-mmm-yyyy hh:mm");
    sheet.getRange("C:C").setNumberFormat("dd-mmm-yyyy");
    sheet.setColumnWidths(1, HEADERS.length, 150);
    sheet.setColumnWidth(HEADERS.indexOf("Address") + 1, 280);
  }
  return sheet;
}

function getFolder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function clean_(v) {
  // strip leading =,+,-,@ to prevent spreadsheet formula injection
  return String(v == null ? "" : v).trim().replace(/^[=+\-@]+/, "");
}

function savePhoto_(dataUrl, name) {
  if (!dataUrl) return "";
  const m = String(dataUrl).match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!m) return "";
  const ext = m[1].split("/")[1].replace("jpeg", "jpg");
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
  const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1],
    (clean_(name) || "student") + "_" + stamp + "." + ext);
  const file = getFolder_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if (d.website) return ContentService.createTextOutput(JSON.stringify({ status: "ok" })) // honeypot
      .setMimeType(ContentService.MimeType.JSON);
    const required = ["studentName", "dob", "grade", "school", "parentName", "phone", "email", "address"];
    for (const k of required) if (!String(d[k] || "").trim()) throw new Error("Missing field: " + k);

    const photoUrl = savePhoto_(d.photo, d.photoName || d.studentName);
    getSheet_().appendRow([
      new Date(),
      clean_(d.studentName),
      clean_(d.dob),
      clean_(d.grade),
      clean_(d.school),
      clean_(d.centreName || d.centre),
      photoUrl,
      clean_(d.parentName),
      String(d.phone).trim(),
      clean_(d.email),
      clean_(d.address),
      clean_(d.ref),
      String(d.aadhaar || "").replace(/\D/g, "")
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Open the Web App URL in a browser to confirm it is deployed.
function doGet() {
  return ContentService.createTextOutput("Q-School admission endpoint is live.");
}
