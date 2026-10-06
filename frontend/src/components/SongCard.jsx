import { Play, Radio } from "lucide-react";

export default function SongCard({ song, onSelect }) {
  return (
    <button className="song-card" onClick={() => onSelect(song)}>
      <div className="song-art">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="song-cover-img"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <>
            <div className="art-glow" />
            <Radio size={32} />
          </>
        )}

        <div className="mini-equalizer">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="song-card-info">
        <div>
          <p className="song-title">{song.title}</p>
          <p className="song-artist">
            {song.artist} {song.genre ? `• ${song.genre}` : ""}
          </p>
        </div>

        <div className="play-circle">
          <Play size={17} fill="currentColor" />
        </div>
      </div>
    </button>
  );
}