import { useMemo } from "react";

export default function useStreamingStats(stats = {}) {
  return useMemo(() => {
    const buffer = Number(stats?.buffer || 0);
    const throughput = Number(stats?.throughput || 0);
    const startup = Number(stats?.startupTime || 0);

    return {
      ...stats,

      bufferText: `${buffer.toFixed(1)}s`,

      throughputText:
        throughput >= 1000
          ? `${(throughput / 1000).toFixed(1)} Mbps`
          : `${throughput.toFixed(0)} Kbps`,

      startupText:
        startup > 0
          ? `${startup.toFixed(0)} ms`
          : "--"
    };
  }, [stats]);
}