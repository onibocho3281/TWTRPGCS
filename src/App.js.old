import React, { useEffect, useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import {
  listUserWitcherSheets,
  copyTemplateToUserDrive,
  readSheetRange,
  writeSheetRange
} from "./DriveSheetsAPI";

const TEMPLATE_FILE_ID = process.env.REACT_APP_TEMPLATE_FILE_ID || "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ";

// Configure which ranges are editable and which to display.
// **CRITICAL**: change these to match your sheet. Do NOT include formula cells in editable ranges.
const RANGES = {
  DISPLAY_RANGE: "General!A1:AI73", // used to render viewer
  NAME_RANGE: "General!A1",         // where the character name lives
  BASE_STATS_RANGE: "General!B16:B22" // single-column range cells for base stats
};

// helper to convert rows (from Sheets API) to grid (row-major) for rendering
function rowsToGrid(rows) {
  return rows || [];
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selected, setSelected] = useState(null); // {id, name}
  const [sheetGrid, setSheetGrid] = useState([]);
  const [loading, setLoading] = useState(false);
  const [baseStatsLocal, setBaseStatsLocal] = useState([]);

  // Sign in
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = result._tokenResponse ? result._tokenResponse : result;
      // Firebase v9 returns accessToken on result.credential.accessToken if using popup provider
      const accessToken = result.user ? (result.user.accessToken || (result.credential && result.credential.accessToken)) : null;
      // A reliable way:
      const accessTokenAlt = result?.credential?.accessToken;
      const finalToken = accessToken || accessTokenAlt;
      setUser(result.user);
      setToken(finalToken);
      // load user's sheets immediately
      fetchUserSheets(finalToken);
    } catch (err) {
      console.error("Sign-in error:", err);
      alert("Sign-in failed. Check console.");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    setSheets([]);
    setSelected(null);
    setSheetGrid([]);
  };

  // list user's Witcher sheets
  const fetchUserSheets = async (accessToken) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const files = await listUserWitcherSheets(accessToken);
      setSheets(files);
    } catch (err) {
      console.error(err);
      alert("Failed to list sheets. Check permissions and scopes.");
    } finally {
      setLoading(false);
    }
  };

  // Create a new character in user's Drive by copying the template
  const createNewCharacter = async (name) => {
    if (!token) return alert("Sign in first");
    if (!name) return alert("Enter a name");
    setLoading(true);
    try {
      const copy = await copyTemplateToUserDrive(token, TEMPLATE_FILE_ID, `Witcher Character Sheet - ${name}`);
      // Refresh list and open this one
      await fetchUserSheets(token);
      const newFile = { id: copy.id, name: copy.name };
      setSelected(newFile);
      await openSheet(newFile.id);
    } catch (err) {
      console.error(err);
      alert("Failed to create copy: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // load a sheet into the viewer
  const openSheet = async (sheetId) => {
    if (!token) return alert("Sign in first");
    setLoading(true);
    try {
      const rows = await readSheetRange(token, sheetId, RANGES.DISPLAY_RANGE);
      setSheetGrid(rowsToGrid(rows));
      // Read base stats separately (so we fill editable inputs)
      const baseArray = await readSheetRange(token, sheetId, RANGES.BASE_STATS_RANGE);
      // baseArray is array of rows; convert to 1D
      const baseFlat = (baseArray || []).map(r => r[0] || "");
      setBaseStatsLocal(baseFlat);
      setSelected({ id: sheetId });
    } catch (err) {
      console.error(err);
      alert("Failed to open sheet: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save editable fields back to sheet (only safe ranges)
  const saveEdits = async () => {
    if (!token || !selected) return alert("Sign in and open a sheet first");
    setLoading(true);
    try {
      // Save name (optional): read from sheetGrid cell for NAME_RANGE? easier: ask user or write provided char name input
      // For safety, only write ranges configured above.
      // Write base stats back as column values (array of arrays)
      const values = baseStatsLocal.map(v => [v]);
      await writeSheetRange(token, selected.id, RANGES.BASE_STATS_RANGE, values);
      alert("Saved base stats to sheet.");
      // reload to show recalculated derived stats
      await openSheet(selected.id);
    } catch (err) {
      console.error(err);
      alert("Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // UI helpers
  const handleBaseStatChange = (i, v) => {
    const copy = [...baseStatsLocal];
    copy[i] = v;
    setBaseStatsLocal(copy);
  };

  // small helper to render the display grid (very simple)
  const renderGrid = (grid) => {
    if (!grid || grid.length === 0) return <p>No data loaded.</p>;
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse" }}>
          <tbody>
            {grid.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px",
                      minWidth: 80,
                      maxWidth: 220,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: 16, fontFamily: "Arial, sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>🧙 Witcher Character Manager</h1>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 8 }}>Signed in</span>
              <button onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <button onClick={handleSignIn}>Sign in with Google</button>
          )}
        </div>
      </header>

      <main>
        {user && (
          <>
            <section style={{ marginBottom: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
              <h2 style={{ marginTop: 0 }}>Your Witcher Sheets</h2>
              <div style={{ marginBottom: 8 }}>
                <button
                  onClick={() => fetchUserSheets(token)}
                  disabled={loading}
                >
                  Refresh list
                </button>
              </div>
              {loading ? <p>Loading...</p> : (
                <ul>
                  {sheets.length === 0 && <li>No Witcher sheets found in your Drive.</li>}
                  {sheets.map(f => (
                    <li key={f.id} style={{ marginBottom: 6 }}>
                      <button onClick={() => openSheet(f.id)} style={{ marginRight: 8 }}>{f.name}</button>
                      <a href={`https://docs.google.com/spreadsheets/d/${f.id}/edit`} target="_blank" rel="noreferrer">Open in Drive</a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={{ marginBottom: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
              <h2 style={{ marginTop: 0 }}>Create New Character</h2>
              <CreateNewForm onCreate={createNewCharacter} loading={loading} />
              <p style={{ marginTop: 8, fontSize: 13 }}>
                This will copy the template into your Drive. The app will automatically open the new copy.
              </p>
            </section>

            {selected && (
              <>
                <section style={{ marginBottom: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                  <h2 style={{ marginTop: 0 }}>Open Sheet Viewer / Editor</h2>
                  <div style={{ marginBottom: 8 }}>
                    <button onClick={() => openSheet(selected.id)}>Reload</button>
                    <button onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${selected.id}/edit`, "_blank")} style={{ marginLeft: 8 }}>
                      Open in Drive
                    </button>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <h3>Base Stats (editable)</h3>
                    {baseStatsLocal.length === 0 ? <p>No base stats found.</p> : (
                      <div>
                        {baseStatsLocal.map((val, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                            <label style={{ width: 160 }}>Stat #{idx + 1}</label>
                            <input value={val} onChange={(e) => handleBaseStatChange(idx, e.target.value)} />
                          </div>
                        ))}
                        <div style={{ marginTop: 8 }}>
                          <button onClick={saveEdits} disabled={loading}>Save edits</button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                  <h2 style={{ marginTop: 0 }}>Full Sheet (read-only view)</h2>
                  {renderGrid(sheetGrid)}
                </section>
              </>
            )}
          </>
        )}

        {!user && (
          <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <p>Please sign in with Google to manage your Witcher sheets in Drive.</p>
            <p>Sign-in will request permission to list and create spreadsheets in your Drive and to read/write spreadsheet values.</p>
          </section>
        )}
      </main>
    </div>
  );
}

// small helper component
function CreateNewForm({ onCreate, loading }) {
  const [name, setName] = useState("");
  return (
    <div>
      <input placeholder="Character name" value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => onCreate(name)} disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}

export default App;
