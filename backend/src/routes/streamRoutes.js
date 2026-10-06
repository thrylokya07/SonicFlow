const express = require("express");
const fs = require("fs");
const path = require("path");

const cacheService = require("../services/cacheService");
const {
  getNetworkProfile,
  delay
} = require("../services/networkService");

const router = express.Router();

const HLS_ROOT = path.join(
  __dirname,
  "../../../audio/hls"
);

function isValidQuality(quality) {
  return ["64", "128", "256"].includes(quality);
}

function isSafeSongId(songId) {
  return /^[a-zA-Z0-9_-]+$/.test(songId);
}

function getNetwork(req) {
  return req.query.network || "excellent";
}

async function sendBufferFile(req, res, filePath, contentType) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Streaming file not found");
  }

  const network = getNetwork(req);
  const networkProfile = getNetworkProfile(network);

  const cacheKey = filePath;

  let data = cacheService.get(cacheKey);
  let cacheStatus = "HIT";

  if (!data) {
    data = fs.readFileSync(filePath);
    cacheService.set(cacheKey, data);
    cacheStatus = "MISS";
  }

  // Simulate network conditions.
  await delay(networkProfile.delay);

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("X-Cache", cacheStatus);
  res.setHeader("X-Network", networkProfile.label);
  res.setHeader("Content-Length", data.length);

  res.send(data);
}

/*
  MASTER PLAYLIST
  /api/stream/:songId/master.m3u8?network=slow
*/
router.get("/:songId/master.m3u8", async (req, res) => {
  const { songId } = req.params;

  if (!isSafeSongId(songId)) {
    return res.status(400).send("Invalid song ID");
  }

  const network = getNetwork(req);

  const playlist = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    "#EXT-X-INDEPENDENT-SEGMENTS",

    `#EXT-X-STREAM-INF:BANDWIDTH=64000,CODECS="mp4a.40.2"`,
    `/api/stream/${songId}/64/playlist.m3u8?network=${network}`,

    `#EXT-X-STREAM-INF:BANDWIDTH=128000,CODECS="mp4a.40.2"`,
    `/api/stream/${songId}/128/playlist.m3u8?network=${network}`,

    `#EXT-X-STREAM-INF:BANDWIDTH=256000,CODECS="mp4a.40.2"`,
    `/api/stream/${songId}/256/playlist.m3u8?network=${network}`
  ].join("\n");

  await delay(getNetworkProfile(network).delay);

  res.setHeader(
    "Content-Type",
    "application/vnd.apple.mpegurl"
  );

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Network", getNetworkProfile(network).label);

  res.send(playlist);
});

/*
  QUALITY PLAYLIST
  /api/stream/:songId/:quality/playlist.m3u8?network=good
*/
router.get(
  "/:songId/:quality/playlist.m3u8",
  async (req, res) => {
    const { songId, quality } = req.params;

    if (!isSafeSongId(songId)) {
      return res.status(400).send("Invalid song ID");
    }

    if (!isValidQuality(quality)) {
      return res.status(400).send("Invalid quality");
    }

    let targetSong = songId;
    let playlistPath = path.join(
      HLS_ROOT,
      targetSong,
      quality,
      "playlist.m3u8"
    );

    // Fallback to song1 audio directory if target song folder doesn't exist on disk
    if (!fs.existsSync(playlistPath)) {
      targetSong = "song1";
      playlistPath = path.join(
        HLS_ROOT,
        targetSong,
        quality,
        "playlist.m3u8"
      );
    }

    if (!fs.existsSync(playlistPath)) {
      return res.status(404).send(
        "HLS playlist not generated. Run npm run generate-hls first."
      );
    }

    const network = getNetwork(req);

    let playlist = fs.readFileSync(
      playlistPath,
      "utf8"
    );

    // Replace segment names with API URLs.
    playlist = playlist
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();

        if (
          trimmed &&
          !trimmed.startsWith("#") &&
          trimmed.endsWith(".ts")
        ) {
          return `/api/stream/${songId}/${quality}/${trimmed}?network=${network}`;
        }

        return line;
      })
      .join("\n");

    await delay(getNetworkProfile(network).delay);

    res.setHeader(
      "Content-Type",
      "application/vnd.apple.mpegurl"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=60"
    );

    res.setHeader(
      "X-Network",
      getNetworkProfile(network).label
    );

    res.send(playlist);
  }
);

/*
  AUDIO CHUNK
  /api/stream/:songId/:quality/:segment?network=slow
*/
router.get(
  "/:songId/:quality/:segment",
  async (req, res) => {
    const { songId, quality, segment } = req.params;

    if (!isSafeSongId(songId)) {
      return res.status(400).send("Invalid song ID");
    }

    if (!isValidQuality(quality)) {
      return res.status(400).send("Invalid quality");
    }

    if (!/^segment\d+\.ts$/.test(segment)) {
      return res.status(400).send("Invalid segment");
    }

    let targetSong = songId;
    let filePath = path.join(
      HLS_ROOT,
      targetSong,
      quality,
      segment
    );

    // Fallback to song1 audio directory if target song segment doesn't exist on disk
    if (!fs.existsSync(filePath)) {
      targetSong = "song1";
      filePath = path.join(
        HLS_ROOT,
        targetSong,
        quality,
        segment
      );
    }

    await sendBufferFile(
      req,
      res,
      filePath,
      "video/mp2t"
    );
  }
);

module.exports = router;