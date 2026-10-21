/**
 * Q-School BMIT Registration – Google Apps Script
 * Paste into: Google Sheet → Extensions → Apps Script
 * Deploy → New deployment → Web app → Execute as: Me, Access: Anyone
 * After editing: Deploy → Manage deployments → Edit → New version.
 */
const SHEET_NAME = "BMIT Registrations";
const HEADERS = ["Timestamp", "Parent Name", "Phone", "Email", "City", "Profession",
  "Child Name", "Age", "Grade", "School",
  "Interested in BMIT", "Interested in Q-Parenting Workshop"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold").setBackground("#0e937e").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.getRange("C:C").setNumberFormat("@"); // keep phone numbers as text
    sheet.getRange("A:A").setNumberFormat("dd-mmm-yyyy hh:mm");
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

function clean_(v) {
  // strip leading =,+,-,@ to prevent spreadsheet formula injection
  return String(v == null ? "" : v).trim().replace(/^[=+\-@]+/, "");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    getSheet_().appendRow([
      new Date(),
      clean_(d.parentName),
      String(d.parentPhone || "").trim(),
      clean_(d.parentEmail),
      clean_(d.city),
      clean_(d.profession),
      clean_(d.childName),
      clean_(d.childAge),
      clean_(d.grade),
      clean_(d.school),
      d.bmit === "Yes" ? "Yes" : "No",
      d.workshop === "Yes" ? "Yes" : "No"
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
  return ContentService.createTextOutput("Q-School BMIT registration endpoint is live.");
}
