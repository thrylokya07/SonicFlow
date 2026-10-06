const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

console.log("\n========================================");
console.log("       🎵 SONICFLOW HLS GENERATOR");
console.log("========================================\n");

const projectRoot = path.resolve(__dirname, "..");
const originalDir = path.join(projectRoot, "audio", "original");
const hlsRoot = path.join(projectRoot, "audio", "hls");

console.log("Project root:", projectRoot);
console.log("Original audio folder:", originalDir);
console.log("HLS output folder:", hlsRoot);

if (!fs.existsSync(originalDir)) {
  console.error(`\n❌ ERROR: ${originalDir} folder does not exist.`);
  process.exit(1);
}

const mp3Files = fs.readdirSync(originalDir).filter((file) => file.toLowerCase().endsWith(".mp3"));

if (mp3Files.length === 0) {
  console.error("\n❌ ERROR: No .mp3 files found in audio/original/");
  process.exit(1);
}

console.log(`\nFound ${mp3Files.length} MP3 file(s):`, mp3Files.join(", "));

const ffmpegCheck = spawnSync("ffmpeg", ["-version"], {
  encoding: "utf8",
  stdio: "pipe",
});

if (ffmpegCheck.error) {
  console.error("\n❌ FFmpeg was not found. Make sure FFmpeg is installed and in PATH.");
  process.exit(1);
}

console.log("✅ FFmpeg found\n");

const qualities = [
  { name: "64", bitrate: "64k" },
  { name: "128", bitrate: "128k" },
  { name: "256", bitrate: "256k" },
];

for (const file of mp3Files) {
  const songId = path.basename(file, path.extname(file));
  const inputFile = path.join(originalDir, file);
  const outputRoot = path.join(hlsRoot, songId);

  const fileStats = fs.statSync(inputFile);
  if (fileStats.size === 0) {
    console.warn(`⚠️ Skipping empty file: ${file}`);
    continue;
  }

  console.log(`========================================`);
  console.log(`Processing: ${file} -> audio/hls/${songId}`);
  console.log(`Size: ${(fileStats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`========================================`);

  fs.mkdirSync(outputRoot, { recursive: true });

  for (const quality of qualities) {
    const outputDir = path.join(outputRoot, quality.name);
    fs.mkdirSync(outputDir, { recursive: true });

    const playlistFile = path.join(outputDir, "playlist.m3u8");
    const segmentPattern = path.join(outputDir, "segment%03d.ts");

    const ffmpegArgs = [
      "-y",
      "-i", inputFile,
      "-vn",
      "-c:a", "aac",
      "-b:a", quality.bitrate,
      "-ar", "44100",
      "-f", "hls",
      "-hls_time", "4",
      "-hls_playlist_type", "vod",
      "-hls_segment_type", "mpegts",
      "-hls_segment_filename", segmentPattern,
      playlistFile,
    ];

    const result = spawnSync("ffmpeg", ffmpegArgs, {
      stdio: "pipe",
      shell: false,
    });

    if (result.error || result.status !== 0) {
      console.error(`❌ Failed to generate ${quality.bitrate} for ${songId}`);
      if (result.stderr) console.error(result.stderr.toString());
      process.exit(1);
    }

    const segmentsCount = fs.readdirSync(outputDir).filter(f => f.endsWith(".ts")).length;
    console.log(`  ✓ ${quality.bitrate} -> ${segmentsCount} segments created`);
  }

  const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:3

#EXT-X-STREAM-INF:BANDWIDTH=64000
64/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=128000
128/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=256000
256/playlist.m3u8
`;

  const masterPath = path.join(outputRoot, "master.m3u8");
  fs.writeFileSync(masterPath, masterPlaylist, "utf8");
  console.log(`  ✅ Master playlist created: audio/hls/${songId}/master.m3u8\n`);
}

console.log("========================================");
console.log("       ✅ ALL HLS STREAMS GENERATED");
console.log("========================================\n");