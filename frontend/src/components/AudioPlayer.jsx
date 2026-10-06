import {
  useEffect,
  useRef,
  useState
} from "react";

import Hls from "hls.js";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward
} from "lucide-react";

import {
  getStreamUrl
} from "../services/api";

export default function AudioPlayer({
  song,
  network,
  onStats,
  onQualityChange
}) {
  const audioRef = useRef(null);
  const hlsRef = useRef(null);

  const startTimeRef = useRef(null);
  const hasStartedRef = useRef(false);

  const [playing, setPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(30);

  const [volume, setVolume] =
    useState(0.8);

  const [muted, setMuted] =
    useState(false);

  const [quality, setQuality] =
    useState(64);

  const [error, setError] =
    useState("");

  const [chunks, setChunks] =
    useState(0);

  const [throughput, setThroughput] =
    useState(0);

  const destroyHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  const setupHls = (
    resumeTime = 0,
    shouldPlay = false
  ) => {
    const audio = audioRef.current;

    if (!audio || !song) {
      return;
    }

    destroyHls();

    setError("");
    setChunks(0);
    setQuality(64);

    hasStartedRef.current = false;

    const url = getStreamUrl(
      song,
      network
    );

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,

        lowLatencyMode: false,

        backBufferLength: 30,

        maxBufferLength: 30,

        maxMaxBufferLength: 60,

        startLevel: 0,

        capLevelToPlayerSize: false
      });

      hlsRef.current = hls;

      hls.loadSource(url);

      hls.attachMedia(audio);

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        async (_, data) => {
          if (data.levels?.length) {
            const first =
              data.levels[0];

            setQuality(
              Math.round(
                (first.bitrate || 64000) /
                  1000
              )
            );
          }

          if (resumeTime > 0) {
            audio.currentTime =
              Math.min(
                resumeTime,
                audio.duration || resumeTime
              );
          }

          if (shouldPlay) {
            try {
              await audio.play();
              setPlaying(true);
            } catch {
              setPlaying(false);
            }
          }
        }
      );

      hls.on(
        Hls.Events.FRAG_LOADED,
        (_, data) => {
          const stats =
            data.frag?.stats;

          if (stats) {
            const bytes =
              stats.loaded || 0;

            const milliseconds =
              stats.loading?.end -
              stats.loading?.start;

            if (
              milliseconds > 0 &&
              bytes > 0
            ) {
              const kbps =
                (bytes * 8) /
                milliseconds;

              setThroughput(kbps);
            }
          }

          setChunks((value) => value + 1);
        }
      );

      hls.on(
        Hls.Events.LEVEL_SWITCHED,
        (_, data) => {
          const level =
            hls.levels[data.level];

          if (level) {
            const kbps = Math.round(
              (level.bitrate || 64000) /
                1000
            );

            setQuality(kbps);

            onQualityChange?.(kbps);
          }
        }
      );

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error encountered. Attempting stream reconnect...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media decoding error encountered. Recovering audio stream...");
              hls.recoverMediaError();
              break;
            default:
              setError(`Fatal streaming error (${data.details || "UNHANDLED"}). Please check connection.`);
              destroyHls();
              break;
          }
        } else {
          console.warn("HLS non-fatal error:", data.type, data.details);
        }
      });
    } else if (
      audio.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ) {
      audio.src = url;

      audio.addEventListener(
        "loadedmetadata",
        () => {
          if (resumeTime > 0) {
            audio.currentTime =
              resumeTime;
          }
        },
        {
          once: true
        }
      );

      if (shouldPlay) {
        audio.play().catch(() => {});
      }
    } else {
      setError(
        "This browser does not support HLS playback."
      );
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song) return;

    const resumeTime = audio.currentTime || 0;
    const wasPlaying = !audio.paused;

    setupHls(resumeTime, wasPlaying);

    return () => {
      destroyHls();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
    };
  }, [song?.songId, song?.id, song?.hlsUrl, network]);

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    const update = () => {
      setCurrentTime(
        audio.currentTime
      );

      if (audio.duration) {
        setDuration(
          audio.duration
        );
      }

      let buffer = 0;

      if (
        audio.buffered.length
      ) {
        const end =
          audio.buffered.end(
            audio.buffered.length - 1
          );

        buffer = Math.max(
          0,
          end - audio.currentTime
        );
      }

      onStats?.({
        buffer,
        throughput,
        startupTime:
          audio.dataset.startup
            ? Number(
                audio.dataset.startup
              )
            : 0,
        downloadedChunks: chunks
      });
    };

    const onPlaying = () => {
      if (
        startTimeRef.current &&
        !hasStartedRef.current
      ) {
        const startup =
          performance.now() -
          startTimeRef.current;

        audio.dataset.startup =
          startup.toString();

        hasStartedRef.current = true;

        onStats?.({
          startupTime: startup
        });
      }

      setPlaying(true);
    };

    const onPause = () => {
      setPlaying(false);
    };

    audio.addEventListener(
      "timeupdate",
      update
    );

    audio.addEventListener(
      "progress",
      update
    );

    audio.addEventListener(
      "playing",
      onPlaying
    );

    audio.addEventListener(
      "pause",
      onPause
    );

    audio.addEventListener(
      "ended",
      onPause
    );

    return () => {
      audio.removeEventListener(
        "timeupdate",
        update
      );

      audio.removeEventListener(
        "progress",
        update
      );

      audio.removeEventListener(
        "playing",
        onPlaying
      );

      audio.removeEventListener(
        "pause",
        onPause
      );

      audio.removeEventListener(
        "ended",
        onPause
      );
    };
  }, [
    chunks,
    throughput,
    onStats
  ]);

  const togglePlay = async () => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      startTimeRef.current =
        performance.now();

      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setError(
          "Playback could not start. Click Play again."
        );
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const seek = (event) => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    const value =
      Number(event.target.value);

    audio.currentTime = value;

    setCurrentTime(value);
  };

  const changeVolume = (event) => {
    const value =
      Number(event.target.value);

    setVolume(value);

    const audio =
      audioRef.current;

    if (audio) {
      audio.volume = value;
      audio.muted = false;
      setMuted(false);
    }
  };

  const toggleMute = () => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    audio.muted =
      !audio.muted;

    setMuted(audio.muted);
  };

  const skip = (seconds) => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime =
      Math.min(
        Math.max(
          audio.currentTime +
            seconds,
          0
        ),
        duration
      );
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const mins =
      Math.floor(seconds / 60);

    const secs =
      Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${mins}:${secs}`;
  };

  return (
    <div className="player-card glass-panel">
      <audio
        ref={audioRef}
        preload="auto"
        volume={volume}
      />

      <div className="player-top">
        <div className="album-art-large">
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
          <span className="eyebrow">
            NOW STREAMING
          </span>

          <h1>
            {song?.title}
          </h1>

          <p>
            {song?.artist} ·{" "}
            {song?.album}
          </p>

          <div className="live-stream-status">
            <span className="pulse-dot" />
            LIVE HLS STREAM
          </div>
        </div>

        <div className="quality-pill">
          {quality} kbps
        </div>
      </div>

      <div className="waveform">
        {Array.from({
          length: 52
        }).map((_, index) => (
          <span
            key={index}
            className={
              playing
                ? "wave-bar playing"
                : "wave-bar"
            }
            style={{
              height: `${
                8 +
                ((index * 17) % 35)
              }px`
            }}
          />
        ))}
      </div>

      <div className="seek-area">
        <span>
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min="0"
          max={duration || 30}
          step="0.1"
          value={currentTime}
          onChange={seek}
          className="seek-slider"
        />

        <span>
          {formatTime(duration)}
        </span>
      </div>

      <div className="player-controls">
        <button
          className="icon-btn"
          onClick={() => skip(-10)}
        >
          <SkipBack size={19} />
        </button>

        <button
          className="main-play"
          onClick={togglePlay}
        >
          {playing ? (
            <Pause
              size={24}
              fill="currentColor"
            />
          ) : (
            <Play
              size={24}
              fill="currentColor"
            />
          )}
        </button>

        <button
          className="icon-btn"
          onClick={() => skip(10)}
        >
          <SkipForward size={19} />
        </button>

        <div className="volume-control">
          <button
            className="icon-btn small"
            onClick={toggleMute}
          >
            {muted ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={
              muted ? 0 : volume
            }
            onChange={
              changeVolume
            }
          />
        </div>
      </div>

      {error && (
        <div className="player-error">
          {error}
        </div>
      )}
    </div>
  );
}