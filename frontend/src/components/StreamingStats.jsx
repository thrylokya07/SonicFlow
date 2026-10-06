import {
  Gauge,
  Timer,
  Download,
  Layers
} from "lucide-react";

export default function StreamingStats({
  stats
}) {
  const cards = [
    {
      label: "THROUGHPUT",
      value: stats.throughputText,
      icon: Gauge
    },
    {
      label: "STARTUP",
      value: stats.startupText,
      icon: Timer
    },
    {
      label: "CHUNKS",
      value: stats.downloadedChunks,
      icon: Layers
    },
    {
      label: "CACHE",
      value: stats.cacheText || stats.cache || "WAITING",
      icon: Download
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            className="stat-card glass-panel"
            key={card.label}
          >
            <div className="stat-icon">
              <Icon size={18} />
            </div>

            <div className="stat-content">
              <span>{card.label}</span>

              <strong>
                {card.value}
              </strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}