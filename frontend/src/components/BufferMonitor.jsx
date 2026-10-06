import {
  Database
} from "lucide-react";

export default function BufferMonitor({
  buffer
}) {
  const value = Math.min(
    Math.max(buffer * 8, 0),
    100
  );

  return (
    <div className="stat-card glass-panel">
      <div className="stat-icon">
        <Database size={19} />
      </div>

      <div className="stat-content">
        <span>
          BUFFER
        </span>

        <strong>
          {buffer.toFixed(1)}s
        </strong>

        <div className="progress">
          <div
            className="progress-fill"
            style={{
              width: `${value}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}