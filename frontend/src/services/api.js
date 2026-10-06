const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export async function getSongs() {
  const response = await fetch(
    `${API_BASE}/api/songs`
  );

  if (!response.ok) {
    throw new Error("Failed to load songs");
  }

  return response.json();
}

export function getStreamUrl(song, network = "excellent") {
  let path = "";

  if (typeof song === "object" && song !== null) {
    path = song.hlsUrl || `/api/stream/${song.songId || song.id}/master.m3u8`;
  } else if (typeof song === "string") {
    path = song.startsWith("/") ? song : `/api/stream/${song}/master.m3u8`;
  } else {
    path = "/api/stream/song1/master.m3u8";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return network ? `${path}?network=${network}` : path;
  }

  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  const fullUrl = `${API_BASE}${path}`;
  return network ? `${fullUrl}?network=${network}` : fullUrl;
}

export { API_BASE };