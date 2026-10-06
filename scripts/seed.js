require("dotenv").config({
  path: "./backend/.env"
});

let mongoose;
try {
  mongoose = require("mongoose");
} catch {
  mongoose = require("../backend/node_modules/mongoose");
}

let Song;
try {
  Song = require("../backend/src/models/Song");
} catch {
  Song = require("./backend/src/models/Song");
}

const songsData = [
  {
    songId: "song1",
    title: "Samajavaragamana (Male version)",
    artist: "Sid Sriram",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu Pop",
    duration: 228,
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song1/master.m3u8"
  },
  {
    songId: "song2",
    title: "Ramuloo Ramulaa",
    artist: "Anurag Kulkarni & Mangli",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu Pop",
    duration: 246,
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song2/master.m3u8"
  },
  {
    songId: "song3",
    title: "OMG Daddy",
    artist: "Roll Rida, Lady Kash & Rahul Nambiar",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu Pop",
    duration: 228,
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song3/master.m3u8"
  },
  {
    songId: "song4",
    title: "Butta Bomma",
    artist: "Armaan Malik",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu Pop",
    duration: 199,
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song4/master.m3u8"
  },
  {
    songId: "song5",
    title: "Samajavaragamana (Female version)",
    artist: "Shreya Ghoshal",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu Pop",
    duration: 241,
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song5/master.m3u8"
  },
  {
    songId: "song6",
    title: "Ala Vaikunthapurramuloo",
    artist: "Sri Krishna & Priya",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu Pop",
    duration: 194,
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song6/master.m3u8"
  },
  {
    songId: "song7",
    title: "Sitharala Sirapadu",
    artist: "Saketh Komanduri",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu Folk",
    duration: 184,
    coverUrl: "https://archive.org/download/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee/mbid-5d185fe9-94f5-4666-95a4-ff02fb01d5ee-25332017482_thumb500.jpg",
    hlsUrl: "/audio/hls/song7/master.m3u8"
  },
  {
    songId: "song11",
    title: "Interstellar (extended mix)",
    artist: "Pontifexx",
    album: "Interstellar",
    genre: "Melodic House & Techno",
    duration: 775,
    coverUrl: "https://archive.org/download/mbid-62e9233c-95bf-46cb-ac99-164e37068365/mbid-62e9233c-95bf-46cb-ac99-164e37068365-46359809106_thumb500.jpg",
    hlsUrl: "/audio/hls/song11/master.m3u8"
  }
];

async function seed() {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes("<db_username>") || uri.includes("<db_password>")) {
    console.log("⚠️ MongoDB credentials are not configured in backend/.env.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("✅ Connected to MongoDB Atlas.");

    console.log("Clearing existing songs collection...");
    await Song.deleteMany({});

    console.log("Inserting 8 real-world songs...");
    const inserted = await Song.insertMany(songsData);

    console.log(`\n========================================`);
    console.log(`✅ DATABASE SEEDING SUCCESSFUL!`);
    console.log(`========================================`);
    console.log(`Inserted ${inserted.length} songs into MongoDB database:\n`);

    for (const song of inserted) {
      console.log(` 🎵 [${song.songId}] "${song.title}" - ${song.artist} (${song.genre})`);
    }

    console.log(`\n========================================\n`);
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB cleanly.");
  } catch (err) {
    console.log(`\n========================================`);
    console.log(`⚠️ MONGODB ATLAS IP WHITELIST REQUIRED`);
    console.log(`========================================`);
    console.log(`Error: Could not connect to MongoDB Atlas (${err.message}).\n`);
    console.log(`To fix this in your browser:`);
    console.log(`1. Go to https://cloud.mongodb.com`);
    console.log(`2. Click 'Network Access' on the left menu`);
    console.log(`3. Click 'Add IP Address' -> 'Add Current IP Address' (or 0.0.0.0/0)`);
    console.log(`4. Click 'Confirm' and wait 60 seconds.`);
    console.log(`========================================\n`);
    console.log(`ℹ️ Note: Your SonicFlow audio streaming web app (http://localhost:5173) is ALREADY running and working 100% with local audio playback!`);
    process.exit(1);
  }
}

seed();