import {
  ArrowRight,
  Radio,
  Activity,
  Zap
} from "lucide-react";

import SongCard from "../components/SongCard";

export default function Home({
  songs,
  onSelect
}) {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="status-badge">
            <span className="pulse-dot" />
            STREAMING ENGINE ONLINE
          </div>

          <h1>
            Music that starts
            <span> before it finishes.</span>
          </h1>

          <p>
            SonicFlow demonstrates how modern
            streaming delivers audio progressively
            using HLS chunks, buffering, adaptive
            bitrate and caching.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              onSelect(songs[0])
            }
          >
            Start streaming
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="hero-visual">
          <div className="orb orb-one" />
          <div className="orb orb-two" />

          <div className="stream-card glass-panel">
            <div className="stream-card-top">
              <div className="mini-art">
                SF
              </div>

              <div>
                <span>
                  LIVE STREAM
                </span>

                <strong>
                  Neon Dreams
                </strong>
              </div>

              <Radio size={20} />
            </div>

            <div className="hero-wave">
              {Array.from({
                length: 32
              }).map((_, i) => (
                <i
                  key={i}
                  style={{
                    height: `${
                      12 +
                      ((i * 13) % 42)
                    }px`
                  }}
                />
              ))}
            </div>

            <div className="stream-line">
              <div />
            </div>

            <div className="stream-metrics">
              <div>
                <span>BUFFER</span>
                <strong>8.4s</strong>
              </div>

              <div>
                <span>QUALITY</span>
                <strong>256k</strong>
              </div>

              <div>
                <span>LATENCY</span>
                <strong>142ms</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-row">
        <div className="feature">
          <Zap size={19} />
          <div>
            <strong>Fast startup</strong>
            <span>
              Playback begins from buffered chunks.
            </span>
          </div>
        </div>

        <div className="feature">
          <Activity size={19} />
          <div>
            <strong>Adaptive quality</strong>
            <span>
              Bitrate responds to network conditions.
            </span>
          </div>
        </div>

        <div className="feature">
          <Radio size={19} />
          <div>
            <strong>HLS streaming</strong>
            <span>
              Audio is divided into small segments.
            </span>
          </div>
        </div>
      </section>

      <section className="songs-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              SONICFLOW LIBRARY
            </span>

            <h2>
              Choose a stream
            </h2>
          </div>
        </div>

        <div className="song-list">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onSelect={onSelect}
            />
          ))}
        </div>
      </section>
    </main>
  );
}