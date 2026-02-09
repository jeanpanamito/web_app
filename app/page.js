"use client";
import { useState, useEffect } from 'react';

export default function Home() {
    const [status, setStatus] = useState("IDLE");
    const [secret, setSecret] = useState("");
    const [history, setHistory] = useState([]);
    const [scheduled, setScheduled] = useState(null);
    const [scheduledTime, setScheduledTime] = useState("");

    // Fetch history on mount and every 10 seconds
    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/history');
            if (res.ok) {
                const data = await res.json();
                setHistory(data.history || []);
                setScheduled(data.scheduled);
            }
        } catch (e) {
            console.error('Error fetching history:', e);
        }
    };

    const sendCommand = async (action, scheduledTimeParam = null) => {
        setStatus("SENDING...");
        try {
            const body = { action, secret };
            if (scheduledTimeParam) {
                body.scheduledTime = scheduledTimeParam;
            }

            const res = await fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                if (action === 'SHUTDOWN') {
                    setStatus("COMMAND SENT");
                } else if (action === 'SCHEDULE') {
                    setStatus("SHUTDOWN SCHEDULED");
                } else {
                    setStatus("CANCELLED");
                }
                fetchHistory(); // Refresh history
            } else {
                const data = await res.json();
                setStatus("ERROR: " + (data.error || "AUTH FAILED"));
            }
        } catch (e) {
            setStatus("ERROR: NETWORK/SERVER");
        }
    };

    const handleSchedule = () => {
        if (!scheduledTime) {
            setStatus("ERROR: NO TIME SELECTED");
            return;
        }
        sendCommand('SCHEDULE', scheduledTime);
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'SHUTDOWN': return '#FF4444';
            case 'SCHEDULE': return '#FFAA00';
            case 'CANCEL': return '#00FF41';
            default: return '#00FF41';
        }
    };

    return (
        <main style={{
            backgroundColor: "#000000",
            color: "#00FF41",
            fontFamily: "'Courier New', monospace",
            minHeight: "100vh",
            padding: "20px",
        }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <h1 style={{
                    fontSize: "2.5rem",
                    borderBottom: "2px solid #00FF41",
                    display: "inline-block",
                    paddingBottom: "10px",
                    marginBottom: "10px"
                }}>
                    REMOTE // CONTROL
                </h1>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    &gt;&gt; SYSTEM AUTO-SHUTDOWN PROTOCOL
                </div>
            </div>

            {/* Main Grid Layout */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "20px",
                maxWidth: "1400px",
                margin: "0 auto"
            }}>
                {/* Control Panel Card */}
                <div style={{
                    backgroundColor: "#0a0a0a",
                    border: "2px solid #00FF41",
                    borderRadius: "8px",
                    padding: "25px",
                    boxShadow: "0 0 20px rgba(0, 255, 65, 0.2)"
                }}>
                    <h2 style={{
                        fontSize: "1.3rem",
                        marginBottom: "20px",
                        color: "#00FF41",
                        borderBottom: "1px solid #00FF41",
                        paddingBottom: "8px"
                    }}>
                        &gt;&gt; IMMEDIATE CONTROL
                    </h2>

                    <input
                        type="password"
                        placeholder="••••  ENTER SECRET PIN"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        style={{
                            width: "100%",
                            backgroundColor: "#111",
                            border: "1px solid #00FF41",
                            color: "#00FF41",
                            padding: "12px",
                            fontFamily: "inherit",
                            marginBottom: "20px",
                            textAlign: "center",
                            fontSize: "1rem",
                            borderRadius: "4px"
                        }}
                    />

                    <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                        <button
                            onClick={() => sendCommand('SHUTDOWN')}
                            style={{
                                flex: 1,
                                backgroundColor: "#004400",
                                color: "#00FF41",
                                border: "2px solid #00FF41",
                                padding: "15px 20px",
                                fontSize: "1rem",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                borderRadius: "4px",
                                transition: "all 0.3s"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#006600"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#004400"}
                        >
                            [ INITIATE SHUTDOWN ]
                        </button>

                        <button
                            onClick={() => sendCommand('CANCEL')}
                            style={{
                                flex: 1,
                                backgroundColor: "#440000",
                                color: "#FF0000",
                                border: "2px solid #FF0000",
                                padding: "15px 20px",
                                fontSize: "1rem",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                borderRadius: "4px",
                                transition: "all 0.3s"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#660000"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#440000"}
                        >
                            [ ABORT ]
                        </button>
                    </div>

                    <div style={{
                        backgroundColor: "#050505",
                        border: "1px solid #333",
                        padding: "12px",
                        textAlign: "center",
                        fontSize: "1.1rem",
                        borderRadius: "4px"
                    }}>
                        STATUS: <span style={{ color: status.includes("ERROR") ? "#FF0000" : "#00FF41" }}>{status}</span>
                    </div>
                </div>

                {/* Scheduled Shutdown Card */}
                <div style={{
                    backgroundColor: "#0a0a0a",
                    border: "2px solid #FFAA00",
                    borderRadius: "8px",
                    padding: "25px",
                    boxShadow: "0 0 20px rgba(255, 170, 0, 0.2)"
                }}>
                    <h2 style={{
                        fontSize: "1.3rem",
                        marginBottom: "20px",
                        color: "#FFAA00",
                        borderBottom: "1px solid #FFAA00",
                        paddingBottom: "8px"
                    }}>
                        &gt;&gt; SCHEDULED SHUTDOWN
                    </h2>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#999" }}>
                            SELECT DATE & TIME:
                        </label>
                        <input
                            type="datetime-local"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            style={{
                                width: "100%",
                                backgroundColor: "#111",
                                border: "1px solid #FFAA00",
                                color: "#FFAA00",
                                padding: "12px",
                                fontFamily: "inherit",
                                fontSize: "1rem",
                                borderRadius: "4px"
                            }}
                        />
                    </div>

                    <button
                        onClick={handleSchedule}
                        style={{
                            width: "100%",
                            backgroundColor: "#443300",
                            color: "#FFAA00",
                            border: "2px solid #FFAA00",
                            padding: "15px 20px",
                            fontSize: "1rem",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            borderRadius: "4px",
                            marginBottom: "20px",
                            transition: "all 0.3s"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#554400"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#443300"}
                    >
                        [ SCHEDULE SHUTDOWN ]
                    </button>

                    {scheduled && (
                        <div style={{
                            backgroundColor: "#050505",
                            border: "1px solid #FFAA00",
                            padding: "15px",
                            borderRadius: "4px"
                        }}>
                            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "5px" }}>
                                ACTIVE SCHEDULE:
                            </div>
                            <div style={{ color: "#FFAA00", fontSize: "1.1rem" }}>
                                {formatTimestamp(scheduled.targetTime)}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "5px" }}>
                                Scheduled at: {formatTimestamp(scheduled.createdAt)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Command History Card */}
                <div style={{
                    backgroundColor: "#0a0a0a",
                    border: "2px solid #00AAFF",
                    borderRadius: "8px",
                    padding: "25px",
                    boxShadow: "0 0 20px rgba(0, 170, 255, 0.2)",
                    gridColumn: "1 / -1"
                }}>
                    <h2 style={{
                        fontSize: "1.3rem",
                        marginBottom: "20px",
                        color: "#00AAFF",
                        borderBottom: "1px solid #00AAFF",
                        paddingBottom: "8px"
                    }}>
                        &gt;&gt; COMMAND HISTORY
                    </h2>

                    {history.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "30px",
                            color: "#666",
                            fontSize: "0.9rem"
                        }}>
                            NO COMMANDS RECORDED YET
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gap: "10px"
                        }}>
                            {history.map((cmd, index) => (
                                <div
                                    key={index}
                                    style={{
                                        backgroundColor: "#050505",
                                        border: `1px solid ${getActionColor(cmd.action)}`,
                                        borderLeft: `4px solid ${getActionColor(cmd.action)}`,
                                        padding: "12px 15px",
                                        borderRadius: "4px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0a0a0a"}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#050505"}
                                >
                                    <div style={{ flex: 1 }}>
                                        <span style={{
                                            color: getActionColor(cmd.action),
                                            fontWeight: "bold",
                                            marginRight: "15px"
                                        }}>
                                            [{cmd.action}]
                                        </span>
                                        <span style={{ color: "#999", fontSize: "0.85rem" }}>
                                            {cmd.status.toUpperCase()}
                                        </span>
                                        {cmd.scheduledTime && (
                                            <span style={{ color: "#FFAA00", fontSize: "0.85rem", marginLeft: "10px" }}>
                                                → {formatTimestamp(cmd.scheduledTime)}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ color: "#666", fontSize: "0.85rem" }}>
                                        {formatTimestamp(cmd.timestamp)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                textAlign: "center",
                marginTop: "40px",
                padding: "20px",
                borderTop: "1px solid #222",
                color: "#666",
                fontSize: "0.8rem"
            }}>
                <div>PRECAUTION: SYSTEM SHUTDOWN IS FINAL // USE RESPONSIBLY</div>
                <div style={{ marginTop: "5px" }}>VERSION 2.0.0 // CLOUD ENABLED</div>
            </div>
        </main>
    );
}
