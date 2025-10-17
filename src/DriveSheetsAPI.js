// DriveSheetsAPI.js
export async function copyCharacterSheet(templateId, newName = "New Witcher Character Sheet") {
  const accessToken = localStorage.getItem("googleAccessToken");
  if (!accessToken) throw new Error("No access token found; sign in again.");

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${templateId}/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HTTP ${response.status}: ${err}`);
  }

  return response.json();
}
