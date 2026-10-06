const express = require("express");
const mongoose = require("mongoose");
const Song = require("../models/Song");

const router = express.Router();

const fallbackSongs = [
  {
    id: "song1",
    songId: "song1",
    title: "Samajavaragamana (Male version)",
    artist: "Sid Sriram",
    album: "Ala Vaikunthapurramuloo",
    duration: 228,
    genre: "Telugu Pop",
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song1/master.m3u8"
  },
  {
    id: "song2",
    songId: "song2",
    title: "Ramuloo Ramulaa",
    artist: "Anurag Kulkarni & Mangli",
    album: "Ala Vaikunthapurramuloo",
    duration: 246,
    genre: "Telugu Pop",
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song2/master.m3u8"
  },
  {
    id: "song3",
    songId: "song3",
    title: "OMG Daddy",
    artist: "Roll Rida, Lady Kash & Rahul Nambiar",
    album: "Ala Vaikunthapurramuloo",
    duration: 228,
    genre: "Telugu Pop",
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song3/master.m3u8"
  },
  {
    id: "song4",
    songId: "song4",
    title: "Butta Bomma",
    artist: "Armaan Malik",
    album: "Ala Vaikunthapurramuloo",
    duration: 199,
    genre: "Telugu Pop",
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song4/master.m3u8"
  },
  {
    id: "song5",
    songId: "song5",
    title: "Samajavaragamana (Female version)",
    artist: "Shreya Ghoshal",
    album: "Ala Vaikunthapurramuloo",
    duration: 241,
    genre: "Telugu Pop",
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song5/master.m3u8"
  },
  {
    id: "song6",
    songId: "song6",
    title: "Ala Vaikunthapurramuloo",
    artist: "Sri Krishna & Priya",
    album: "Ala Vaikunthapurramuloo",
    duration: 194,
    genre: "Telugu Pop",
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song6/master.m3u8"
  },
  {
    id: "song7",
    songId: "song7",
    title: "Sitharala Sirapadu",
    artist: "Saketh Komanduri",
    album: "Ala Vaikunthapurramuloo",
    duration: 184,
    genre: "Telugu Folk",
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song7/master.m3u8"
  },
  {
    id: "song11",
    songId: "song11",
    title: "Interstellar (extended mix)",
    artist: "Pontifexx",
    album: "Interstellar",
    duration: 775,
    genre: "Melodic House & Techno",
    coverUrl: "https://archive.org/download/mbid-62e9233c-95bf-46cb-ac99-164e37068365/mbid-62e9233c-95bf-46cb-ac99-164e37068365-46359809106_thumb500.jpg",
    hlsUrl: "/audio/hls/song11/master.m3u8"
  }
];

// GET /api/songs - List all songs (from MongoDB or fallback)
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbSongs = await Song.find().sort({ createdAt: -1 });

      if (dbSongs && dbSongs.length > 0) {
        return res.json({
          success: true,
          source: "database",
          count: dbSongs.length,
          songs: dbSongs.map((s) => s.toJSON())
        });
      }
    }
  } catch (err) {
    console.error("Database query error:", err.message);
  }

  // Fallback if DB is empty or not connected
  res.json({
    success: true,
    source: "fallback",
    count: fallbackSongs.length,
    songs: fallbackSongs
  });
});

// GET /api/songs/:id - Get song by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const dbSong = await Song.findOne({
        $or: [{ songId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });

      if (dbSong) {
        return res.json({
          success: true,
          source: "database",
          song: dbSong.toJSON()
        });
      }
    }
  } catch (err) {
    console.error("Database fetch error:", err.message);
  }

  const song = fallbackSongs.find(
    (item) => item.id === id || item.songId === id
  );

  if (!song) {
    return res.status(404).json({
      success: false,
      message: "Song not found"
    });
  }

  res.json({
    success: true,
    source: "fallback",
    song
  });
});

// POST /api/songs - Add a new real-world song
router.post("/", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected. Please configure MONGO_URI in backend/.env"
    });
  }

  const { songId, title, artist, album, duration, genre, coverUrl, hlsUrl } = req.body;

  if (!songId || !title || !artist || !hlsUrl) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: songId, title, artist, hlsUrl"
    });
  }

  try {
    const newSong = await Song.create({
      songId,
      title,
      artist,
      album: album || "Single",
      duration: Number(duration) || 30,
      genre: genre || "General",
      coverUrl: coverUrl || "",
      hlsUrl
    });

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      song: newSong.toJSON()
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// DELETE /api/songs/:id - Delete a song
router.delete("/:id", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected"
    });
  }

  const { id } = req.params;

  try {
    const deleted = await Song.findOneAndDelete({
      $or: [{ songId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Song not found in database"
      });
    }

    res.json({
      success: true,
      message: "Song deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;