// App.js
import React, { useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { copyCharacterSheet } from "./DriveSheetsAPI";

function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");

  // Sign in with Google and store OAuth token
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) throw new Error("No credential returned");

      const accessToken = credential.accessToken;
      localStorage.setItem("googleAccessToken", accessToken);
      setUser(result.user);
      console.log("✅ Google OAuth token stored:", accessToken);
    } catch (error) {
      console.error("Sign-in error:", error);
      setStatus("Sign-in failed: " + error.message);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut(auth);
    localStorage.removeItem("googleAccessToken");
    setUser(null);
    setStatus("Signed out");
  };

  // Create a new character sheet
  const handleNewCharacter = async () => {
    try {
      setStatus("Creating new character...");
      const templateId = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // <-- Replace with your Google Sheet template ID
      const newSheet = await copyCharacterSheet(templateId);
      console.log("New sheet created:", newSheet);
      setStatus(`New character sheet created: ${newSheet.name}`);
    } catch (err) {
      console.error(err);
      setStatus("Error creating sheet: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>

      {!user ? (
        <button onClick={handleSignIn}>Sign in with Google</button>
      ) : (
        <>
          <p>Signed in as: {user.displayName}</p>
          <button onClick={handleSignOut}>Sign out</button>
          <button onClick={handleNewCharacter} style={{ marginLeft: "10px" }}>
            New Character
          </button>
        </>
      )}

      <p style={{ marginTop: "20px" }}>{status}</p>
    </div>
  );
}

export default App;
