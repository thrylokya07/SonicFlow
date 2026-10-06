import {
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Radio,
  AlertCircle
} from "lucide-react";
import { getStreamUrl } from "../services/api";

export default function AudioPlayer({
  song,
  network = "excellent",
  onStats,
  onQualityChange
}) {
  const audioRef = useRef(null);
  const hlsRef = useRef(null);
  const networkRef = useRef(network);

  const startTimeRef = useRef(null);
  const hasStartedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(song?.duration || 30);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [quality, setQuality] = useState(64);
  const [error, setError] = useState("");
  const [chunks, setChunks] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [throughput, setThroughput] = useState(0);
  const [startupTime, setStartupTime] = useState(0);
  const [cacheStatus, setCacheStatus] = useState("MISS");

  // Keep networkRef synced without re-creating HLS instance on network slider change
  useEffect(() => {
    networkRef.current = network;
  }, [network]);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.detachMedia();
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const setupHls = useCallback(
    (shouldPlay = true) => {
      const audio = audioRef.current;
      if (!audio || !song) return;

      destroyHls();

      setError("");
      setChunks(0);
      setQuality(64);
      setCurrentTime(0);
      setStartupTime(0);
      setCacheStatus("MISS");
      hasStartedRef.current = false;
      startTimeRef.current = performance.now();

      const url = getStreamUrl(song, networkRef.current);

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          startLevel: -1,
          abrEmaFastAudio: 3.0,
          abrEmaSlowAudio: 9.0,
          abrBandWidthFactor: 0.85,
          abrBandWidthUpFactor: 0.7,
          capLevelToPlayerSize: false,
          xhrSetup: (xhr, reqUrl) => {
            if (reqUrl.includes("/api/stream/")) {
              const currentNet = networkRef.current || "excellent";
              let modifiedUrl = reqUrl;
              if (modifiedUrl.includes("network=")) {
                modifiedUrl = modifiedUrl.replace(
                  /network=[^&]+/,
                  `network=${currentNet}`
                );
              } else {
                const separator = modifiedUrl.includes("?") ? "&" : "?";
                modifiedUrl = `${modifiedUrl}${separator}network=${currentNet}`;
              }
              xhr.open("GET", modifiedUrl, true);
            }
          }
        });

        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(audio);

        hls.on(Hls.Events.MANIFEST_PARSED, async (_, data) => {
          if (data.levels?.length) {
            const firstLevel = data.levels[hls.currentLevel >= 0 ? hls.currentLevel : 0] || data.levels[0];
            const kbps = Math.round((firstLevel.bitrate || 64000) / 1000);
            setQuality(kbps);
            onQualityChange?.(kbps);
          }

          if (shouldPlay) {
            try {
              await audio.play();
              setPlaying(true);
            } catch {
              setPlaying(false);
            }
          }
        });

        hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          if (data.details?.fragments) {
            setTotalChunks(data.details.fragments.length);
          }
        });

        hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
          const fragStats = data.frag?.stats;

          if (fragStats) {
            const bytes = fragStats.loaded || fragStats.total || 0;
            const tStart = fragStats.loading?.start || fragStats.trequest || fragStats.tfirst;
            const tEnd = fragStats.loading?.end || fragStats.tload;

            if (tStart && tEnd && tEnd > tStart && bytes > 0) {
              const seconds = (tEnd - tStart) / 1000;
              const kbps = (bytes * 8) / seconds / 1000;
              setThroughput(kbps);
            }
          }

          // Extract X-Cache status header from response
          let fragCache = "MISS";
          try {
            if (data.networkDetails && typeof data.networkDetails.getResponseHeader === "function") {
              const hdr = data.networkDetails.getResponseHeader("X-Cache");
              if (hdr) fragCache = hdr.toUpperCase();
            } else if (data.response && typeof data.response.getResponseHeader === "function") {
              const hdr = data.response.getResponseHeader("X-Cache");
              if (hdr) fragCache = hdr.toUpperCase();
            }
          } catch {
            // fallback keep previous or default
          }
          setCacheStatus(fragCache);

          setChunks((prev) => prev + 1);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          const level = hls.levels[data.level];
          if (level) {
            const kbps = Math.round((level.bitrate || 64000) / 1000);
            setQuality(kbps);
            onQualityChange?.(kbps);
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("Network connection slow/interrupted. Reconnecting...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media decoding error. Recovering audio stream...");
                hls.recoverMediaError();
                break;
              default:
                setError("Unable to stream this audio track. Check backend connection.");
                destroyHls();
                break;
            }
          }
        });
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS (Safari)
        audio.src = url;
        if (shouldPlay) {
          audio.play().catch(() => {});
        }
      } else {
        setError("This browser does not support HLS playback.");
      }
    },
    [song, destroyHls, onQualityChange]
  );

  // Initialize stream whenever song changes
  useEffect(() => {
    if (!song) return;

    setupHls(true);

    return () => {
      destroyHls();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
    };
  }, [song?.songId, song?.id, song?.hlsUrl, setupHls, destroyHls]);

  // Handle HTML5 Audio Telemetry & Events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTelemetry = () => {
      setCurrentTime(audio.currentTime || 0);

      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }

      let buffer = 0;
      if (audio.buffered.length > 0) {
        const end = audio.buffered.end(audio.buffered.length - 1);
        buffer = Math.max(0, end - audio.currentTime);
      }

      onStats?.({
        buffer,
        throughput,
        startupTime,
        downloadedChunks: chunks,
        totalChunks,
        quality,
        cache: cacheStatus
      });
    };

    const onPlaying = () => {
      if (startTimeRef.current && !hasStartedRef.current) {
        const elapsed = performance.now() - startTimeRef.current;
        setStartupTime(elapsed);
        hasStartedRef.current = true;
      }
      setPlaying(true);
    };

    const onPause = () => {
      setPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTelemetry);
    audio.addEventListener("progress", updateTelemetry);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);

    return () => {
      audio.removeEventListener("timeupdate", updateTelemetry);
      audio.removeEventListener("progress", updateTelemetry);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
    };
  }, [chunks, totalChunks, throughput, startupTime, quality, cacheStatus, onStats]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      if (!hasStartedRef.current) {
        startTimeRef.current = performance.now();
      }
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setError("Playback failed. Please click play again.");
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const seek = (event) => {
    const audio = audioRef.current;
    if (!audio) return;

    const value = Number(event.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const changeVolume = (event) => {
    const value = Number(event.target.value);
    setVolume(value);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = value;
      audio.muted = false;
      setMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.min(
      Math.max(audio.currentTime + seconds, 0),
      duration
    );
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || isNaN(seconds)) {
      return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${mins}:${secs}`;
  };

  return (
    <div className="player-card glass-panel">
      <audio ref={audioRef} preload="auto" />

      <div className="player-top">
        <div className="album-art-large">
          {song?.coverUrl ? (
            <img
              src={song.coverUrl}
              alt={song.title}
              className="player-cover-img"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <Radio size={40} className="fallback-art-icon" />
          )}

          <div className="album-ring" />

          <div className="album-center">
            <span>SF</span>
          </div>

          <div className="art-waves">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="player-info">
          <span className="eyebrow">NOW STREAMING</span>

          <h1>{song?.title}</h1>

          <p>
            {song?.artist} · {song?.album || "Single"}
          </p>

          <div className="live-stream-status">
            <span className="pulse-dot" />
            PROGRESSIVE HLS STREAM
          </div>
        </div>

        <div className="quality-pill">{quality} kbps</div>
      </div>

      <div className="waveform">
        {Array.from({ length: 52 }).map((_, index) => (
          <span
            key={index}
            className={playing ? "wave-bar playing" : "wave-bar"}
            style={{
              height: `${8 + ((index * 17) % 35)}px`
            }}
          />
        ))}
      </div>

      <div className="seek-area">
        <span>{formatTime(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={duration || 30}
          step="0.1"
          value={currentTime}
          onChange={seek}
          className="seek-slider"
        />

        <span>{formatTime(duration)}</span>
      </div>

      <div className="player-controls">
        <button
          className="icon-btn"
          onClick={() => skip(-10)}
          title="Rewind 10s"
        >
          <SkipBack size={19} />
        </button>

        <button
          className="main-play"
          onClick={togglePlay}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>

        <button
          className="icon-btn"
          onClick={() => skip(10)}
          title="Forward 10s"
        >
          <SkipForward size={19} />
        </button>

        <div className="volume-control">
          <button className="icon-btn small" onClick={toggleMute}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={changeVolume}
          />
        </div>
      </div>

      {error && (
        <div className="player-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}