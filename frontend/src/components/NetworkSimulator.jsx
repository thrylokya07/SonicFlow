import {
  Wifi,
  Zap,
  Gauge,
  CloudLightning
} from "lucide-react";

const networks = [
  {
    id: "excellent",
    name: "Excellent",
    icon: Zap
  },
  {
    id: "good",
    name: "Good",
    icon: Wifi
  },
  {
    id: "slow",
    name: "Slow",
    icon: Gauge
  },
  {
    id: "verySlow",
    name: "Very Slow",
    icon: CloudLightning
  }
];

export default function NetworkSimulator({
  network,
  onChange
}) {
  return (
    <div className="network-panel glass-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            NETWORK LAB
          </span>

          <h3>
            Simulate connection
          </h3>
        </div>

        <span className="live-dot">
          LIVE
        </span>
      </div>

      <div className="network-buttons">
        {networks.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={
                network === item.id
                  ? "network-btn active"
                  : "network-btn"
              }
              onClick={() =>
                onChange(item.id)
              }
            >
              <Icon size={16} />

              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}