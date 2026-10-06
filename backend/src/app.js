const express = require("express");
const cors = require("cors");
const path = require("path");

const songRoutes = require("./routes/songRoutes");
const streamRoutes = require("./routes/streamRoutes");

const app = express();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = frontendUrl.includes(",")
  ? frontendUrl.split(",").map((u) => u.trim())
  : [frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    exposedHeaders: ["X-Cache", "X-Network", "Content-Length", "Accept-Ranges"]
  })
);

app.use(express.json());

// Serve static HLS audio files under /audio/hls/ with correct HLS MIME headers
app.use(
  "/audio/hls",
  express.static(path.join(__dirname, "../../audio/hls"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache");
      } else if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
        res.setHeader("Cache-Control", "public, max-age=3600");
      }
    }
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎵 SonicFlow Backend API is running",
    endpoints: {
      health: "/api/health",
      songs: "/api/songs",
      stream: "/api/stream/song1/master.m3u8",
      audioHls: "/audio/hls/song1/master.m3u8"
    },
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SonicFlow backend is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/songs", songRoutes);
app.use("/api/stream", streamRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

module.exports = app;