import { useMemo } from "react";

export default function useStreamingStats(stats = {}) {
  return useMemo(() => {
    const buffer = Number(stats?.buffer || 0);
    const throughput = Number(stats?.throughput || 0);
    const startup = Number(stats?.startupTime || 0);
    const cache = stats?.cache || "WAITING";

    return {
      ...stats,

      bufferText: `${buffer.toFixed(1)}s`,

      throughputText:
        throughput >= 1000
          ? `${(throughput / 1000).toFixed(2)} Mbps`
          : throughput > 0
          ? `${throughput.toFixed(0)} Kbps`
          : "Measuring...",

      startupText:
        startup > 0
          ? `${startup.toFixed(0)} ms`
          : "Measuring...",

      cacheText:
        cache === "HIT"
          ? "HIT (Cached)"
          : cache === "MISS"
          ? "MISS (Server)"
          : cache
    };
  }, [stats]);
}