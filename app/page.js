"use client";
import { useState } from 'react';

export default function Home() {
    const [status, setStatus] = useState("IDLE");
    const [secret, setSecret] = useState("");

    const sendCommand = async (action) => {
        setStatus("SENDING...");
        try {
            const res = await fetch('/api/command', {
                method: 'POST',
                body: JSON.stringify({ action, secret }),
            });
            if (res.ok) {
                setStatus(action === 'SHUTDOWN' ? "COMMAND SENT" : "CANCELLED");
            } else {
                setStatus("ERROR: AUTH FAILED");
            }
        } catch (e) {
            setStatus("ERROR: NETWORK");
        }
    };

    return (
        <main style={{
            backgroundColor: "black",
            color: "#00FF41",
            fontFamily: "'Courier New', monospace",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
        }}>
            <h1 style={{ fontSize: "2rem", borderBottom: "2px solid #00FF41", marginBottom: "2rem" }}>
                REMOTE // CONTROL
            </h1>

            <input
                type="password"
                placeholder="ENTER SECRET PIN"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                style={{
                    backgroundColor: "#111",
                    border: "1px solid #00FF41",
                    color: "#00FF41",
                    padding: "10px",
                    fontFamily: "inherit",
                    marginBottom: "20px",
                    textAlign: "center"
                }}
            />

            <div style={{ display: "flex", gap: "20px" }}>
                <button
                    onClick={() => sendCommand('SHUTDOWN')}
                    style={{
                        backgroundColor: "#004400",
                        color: "#00FF41",
                        border: "2px solid #00FF41",
                        padding: "20px 40px",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                        fontFamily: "inherit"
                    }}
                >
                    [ INITIATE SHUTDOWN ]
                </button>

                <button
                    onClick={() => sendCommand('CANCEL')}
                    style={{
                        backgroundColor: "#440000",
                        color: "red",
                        border: "2px solid red",
                        padding: "20px 40px",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                        fontFamily: "inherit"
                    }}
                >
                    [ ABORT ]
                </button>
            </div>

            <div style={{ marginTop: "40px", fontSize: "1.5rem" }}>
                STATUS: {status}
            </div>
        </main>
    );
}
