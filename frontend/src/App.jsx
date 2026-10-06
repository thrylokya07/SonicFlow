import { useEffect, useState, useCallback } from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { getSongs } from "./services/api";

export default function App() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [network, setNetwork] = useState("excellent");
  const [stats, setStats] = useState({
    buffer: 0,
    throughput: 0,
    startupTime: 0,
    downloadedChunks: 0,
    totalChunks: 0,
    quality: 64,
    cache: "WAITING"
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getSongs();
      setSongs(result.songs || []);
    } catch (err) {
      console.error("Error loading songs:", err);
      setError("Unable to connect to SonicFlow streaming server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">SF</div>
        <div className="loader" />
        <p>Initializing streaming engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <div className="error-screen glass-panel">
          <h2>SonicFlow is offline</h2>
          <p>{error}</p>
          <p>Please check backend connectivity or start the server using:</p>
          <code>cd backend &amp;&amp; npm run dev</code>
          <div style={{ marginTop: "20px" }}>
            <button className="primary-button" onClick={loadSongs}>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSong) {
    return <Home songs={songs} onSelect={setSelectedSong} />;
  }

  return (
    <Dashboard
      song={selectedSong}
      network={network}
      setNetwork={setNetwork}
      stats={stats}
      setStats={setStats}
      onBack={() => setSelectedSong(null)}
    />
  );
}