// helper wrapper around Google Drive & Sheets REST APIs using fetch + accessToken
// All functions expect an `accessToken` string (from Firebase credential)
const DRIVE_BASE = "https://www.googleapis.com/drive/v3";
const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

async function fetchJSON(url, accessToken, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

// List spreadsheets in user's drive matching your naming convention
export async function listUserWitcherSheets(accessToken) {
  // Adjust query: look for mimeType spreadsheet and name contains 'Witcher Character Sheet'
  const q = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and name contains 'Witcher Character Sheet'"
  );
  const url = `${DRIVE_BASE}/files?q=${q}&fields=files(id,name,owners)&pageSize=100`;
  const json = await fetchJSON(url, accessToken);
  return json.files || [];
}

// Copy the TEMPLATE into user's Drive, returning new fileId
export async function copyTemplateToUserDrive(accessToken, templateFileId, newName) {
  const url = `${DRIVE_BASE}/files/${templateFileId}/copy`;
  const body = { name: newName };
  const json = await fetchJSON(url, accessToken, { method: "POST", body: JSON.stringify(body) });
  return json; // contains id and other metadata
}

// Read a range via Sheets API
export async function readSheetRange(accessToken, sheetId, range = "General!A1:AI73") {
  const url = `${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`;
  const json = await fetchJSON(url, accessToken);
  // json.values is an array of rows
  return json.values || [];
}

// Write to a range via Sheets API (valueInputOption = USER_ENTERED)
export async function writeSheetRange(accessToken, sheetId, range, values) {
  const url = `${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const body = { range, values };
  const json = await fetchJSON(url, accessToken, { method: "PUT", body: JSON.stringify(body) });
  return json;
}
