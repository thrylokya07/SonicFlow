import {
  Check,
  Download,
  LoaderCircle
} from "lucide-react";

export default function ChunkVisualizer({
  downloadedChunks,
  active
}) {
  const total = 12;

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
          {downloadedChunks} loaded
        </span>
      </div>

      <div className="chunk-track">
        {Array.from({
          length: total
        }).map((_, index) => {
          const loaded =
            index < downloadedChunks;

          const current =
            index === downloadedChunks;

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
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </small>
            </div>
          );
        })}
      </div>

      <div className="chunk-caption">
        <span>
          Each block represents an approximately
          4-second HLS segment.
        </span>
      </div>
    </div>
  );
}