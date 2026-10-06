const assert = require("assert");
const fs = require("fs");
const path = require("path");
const http = require("http");
const app = require("../src/app");

let server;
let baseUrl;

async function runTests() {
  console.log("\n========================================");
  console.log("       🧪 SONICFLOW BACKEND TESTS");
  console.log("========================================\n");

  let passed = 0;
  let failed = 0;

  function test(description, fn) {
    return (async () => {
      try {
        await fn();
        console.log(`  ✅ PASS: ${description}`);
        passed++;
      } catch (err) {
        console.error(`  ❌ FAIL: ${description}`);
        console.error(`     Error: ${err.message}`);
        failed++;
      }
    })();
  }

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  try {
    // 1. /api/health
    await test("GET /api/health returns 200 and success status", async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });

    // 2. /api/songs
    await test("GET /api/songs returns list of songs", async () => {
      const res = await fetch(`${baseUrl}/api/songs`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.songs));
      assert.ok(data.songs.length >= 8);
    });

    // 3. Individual song endpoint
    await test("GET /api/songs/song1 returns song1 details", async () => {
      const res = await fetch(`${baseUrl}/api/songs/song1`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.song.songId, "song1");
    });

    // 4. HLS master playlist
    await test("GET /api/stream/song1/master.m3u8 returns master playlist", async () => {
      const res = await fetch(`${baseUrl}/api/stream/song1/master.m3u8`);
      assert.strictEqual(res.status, 200);
      const contentType = res.headers.get("content-type");
      assert.ok(contentType && contentType.includes("mpegurl"));
      const text = await res.text();
      assert.ok(text.includes("#EXTM3U"));
      assert.ok(text.includes("64/playlist.m3u8"));
    });

    // 5. Invalid song handling
    await test("GET /api/songs/invalid_song_999 returns 404", async () => {
      const res = await fetch(`${baseUrl}/api/songs/invalid_song_999`);
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.strictEqual(data.success, false);
    });

    await test("GET /api/stream/invalid_song_999/master.m3u8 returns 404", async () => {
      const res = await fetch(`${baseUrl}/api/stream/invalid_song_999/master.m3u8`);
      assert.strictEqual(res.status, 404);
    });

    // 6. Audio/HLS file availability on disk
    await test("Verify all 8 songs have MP3 source and HLS master playlists on disk", async () => {
      const expectedSongs = ["song1", "song2", "song3", "song4", "song5", "song6", "song7", "song11"];
      const hlsRoot = path.join(__dirname, "../../audio/hls");
      const origRoot = path.join(__dirname, "../../audio/original");

      for (const songId of expectedSongs) {
        const mp3Path = path.join(origRoot, `${songId}.mp3`);
        assert.ok(fs.existsSync(mp3Path), `Missing MP3 file for ${songId}`);

        const masterPath = path.join(hlsRoot, songId, "master.m3u8");
        assert.ok(fs.existsSync(masterPath), `Missing HLS master playlist for ${songId}`);

        for (const q of ["64", "128", "256"]) {
          const playlistPath = path.join(hlsRoot, songId, q, "playlist.m3u8");
          assert.ok(fs.existsSync(playlistPath), `Missing quality ${q} playlist for ${songId}`);
        }
      }
    });

  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
