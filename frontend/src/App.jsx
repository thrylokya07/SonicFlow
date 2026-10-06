import {
  useEffect,
  useState
} from "react";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

import {
  getSongs
} from "./services/api";

export default function App() {
  const [songs, setSongs] =
    useState([]);

  const [selectedSong, setSelectedSong] =
    useState(null);

  const [network, setNetwork] =
    useState("excellent");

  const [stats, setStats] =
    useState({
      buffer: 0,
      throughput: 0,
      startupTime: 0,
      downloadedChunks: 0,
      quality: 64,
      cache: "WAITING"
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadSongs() {
      try {
        const result =
          await getSongs();

        setSongs(result.songs || []);
      } catch (err) {
        console.error(err);

        setError(
          "Could not connect to SonicFlow backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSongs();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          SF
        </div>

        <div className="loader" />

        <p>
          Initializing streaming engine...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <div className="error-screen">
          <h2>
            SonicFlow is offline
          </h2>

          <p>
            {error}
          </p>

          <p>
            Start the backend using:
          </p>

          <code>
            npm run dev
          </code>
        </div>
      </div>
    );
  }

  if (!selectedSong) {
    return (
      <Home
        songs={songs}
        onSelect={setSelectedSong}
      />
    );
  }

  return (
    <Dashboard
      song={selectedSong}
      network={network}
      setNetwork={setNetwork}
      stats={stats}
      setStats={setStats}
      onBack={() =>
        setSelectedSong(null)
      }
    />
  );
}