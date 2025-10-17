// DriveSheetsAPI.js

export async function createCharacterSheet(userEmail) {
  const scriptUrl = "https://script.google.com/macros/s/AKfycbzAzPGk-I_Kbcfo9G5F2zsPEoWefTcf_B3UPRSDctP9bHl_-r_xy0sRokD0YcWNpM50aw/exec"; // replace with your deployed Apps Script URL

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userEmail })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data; // { id, url, name }
}
