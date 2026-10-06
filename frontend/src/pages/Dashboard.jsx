import { useCallback } from "react";
import { ArrowLeft, Activity } from "lucide-react";
import AudioPlayer from "../components/AudioPlayer";
import BufferMonitor from "../components/BufferMonitor";
import ChunkVisualizer from "../components/ChunkVisualizer";
import NetworkSimulator from "../components/NetworkSimulator";
import QualityIndicator from "../components/QualityIndicator";
import StreamingStats from "../components/StreamingStats";
import useStreamingStats from "../hooks/useStreamingStats";

export default function Dashboard({
  song,
  network,
  setNetwork,
  stats,
  setStats,
  onBack
}) {
  const streamingStats = useStreamingStats(stats);

  const handleStats = useCallback(
    (newStats) => {
      setStats((prev) => ({
        ...prev,
        ...newStats
      }));
    },
    [setStats]
  );

  const handleQualityChange = useCallback(
    (quality) => {
      setStats((prev) => ({
        ...prev,
        quality
      }));
    },
    [setStats]
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to library
        </button>

        <div className="dashboard-title">
          <div className="live-indicator">
            <span />
            STREAMING STUDIO
          </div>
          <h1>Adaptive Bitrate Lab</h1>
        </div>

        <div className="server-status">
          <Activity size={16} />
          ENGINE CONNECTED
        </div>
      </header>

      <div className="dashboard-layout">
        <div className="main-column">
          <AudioPlayer
            song={song}
            network={network}
            onStats={handleStats}
            onQualityChange={handleQualityChange}
          />

          <div className="section-label">TELEMETRY & BUFFER</div>

          <BufferMonitor buffer={stats?.buffer || 0} />

          <ChunkVisualizer
            downloadedChunks={stats?.downloadedChunks || 0}
            totalChunks={stats?.totalChunks || 0}
            active={true}
          />

          <div className="section-label">PERFORMANCE METRICS</div>

          <StreamingStats stats={streamingStats} />
        </div>

        <div className="side-column">
          <div className="side-header">
            <h2>Controls</h2>
          </div>

          <NetworkSimulator network={network} onChange={setNetwork} />

          <QualityIndicator quality={stats?.quality || 64} />
        </div>
      </div>
    </div>
  );
}
