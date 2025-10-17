// DriveSheetsAPI.js
export async function createCharacterSheet(userEmail) {
  const scriptUrl = "https://script.google.com/macros/s/AKfycbxpUtMAzQxeptFAW1fpgOQg1HwSmVCi3_c-s74CDHGhtPA38Ld-zAEokShMpYLG9_wtAA/exec"; // paste your deployed URL

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userEmail })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data; // { id, url, name }
}
