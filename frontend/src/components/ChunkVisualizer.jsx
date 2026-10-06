import {
  Check,
  Download,
  LoaderCircle
} from "lucide-react";

export default function ChunkVisualizer({
  downloadedChunks = 0,
  totalChunks = 0,
  active = true
}) {
  // Show up to 24 chunk indicators dynamically or fallback to 16
  const total = totalChunks > 0 ? Math.min(totalChunks, 24) : 16;

  return (
    <div className="chunk-panel glass-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            HLS PIPELINE
          </span>

          <h3>
            Audio chunks
          </h3>
        </div>

        <span className="chunk-count">
          {downloadedChunks} {totalChunks > 0 ? `/ ${totalChunks}` : ""} loaded
        </span>
      </div>

      <div className="chunk-track">
        {Array.from({
          length: total
        }).map((_, index) => {
          const loaded = index < downloadedChunks;
          const current = index === downloadedChunks;

          return (
            <div
              key={index}
              className={
                loaded
                  ? "chunk loaded"
                  : current && active
                  ? "chunk loading"
                  : "chunk"
              }
              title={`Segment ${index + 1} (${loaded ? "Loaded" : current ? "Downloading" : "Pending"})`}
            >
              {loaded ? (
                <Check size={13} />
              ) : current && active ? (
                <LoaderCircle
                  size={13}
                  className="spin"
                />
              ) : (
                <Download size={13} />
              )}

              <small>
                {String(index + 1).padStart(2, "0")}
              </small>
            </div>
          );
        })}
      </div>

      <div className="chunk-caption">
        <span>
          Each block represents a ~4-second HLS audio segment ({totalChunks > 24 ? `showing first 24 of ${totalChunks} segments` : `total ${totalChunks || total} segments`}).
        </span>
      </div>
    </div>
  );
}