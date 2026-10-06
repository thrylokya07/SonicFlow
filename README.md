# SonicFlow 🎵

## Adaptive Audio Streaming & Visualization Platform

SonicFlow is a simplified Spotify-style streaming system that demonstrates why a song can start playing before the complete audio file has been downloaded.

## Main technologies

### Frontend

- React
- Vite
- hls.js
- JavaScript
- CSS
- Lucide React

### Backend

- Node.js
- Express
- REST API

### Media processing

- FFmpeg
- HLS
- MPEG-TS chunks

### Concepts

- Buffering
- Adaptive bitrate
- Chunked streaming
- Network simulation
- LRU caching
- Streaming analytics

## Architecture

MP3
→ FFmpeg
→ Multiple bitrates
→ HLS chunks
→ Express
→ hls.js
→ Browser buffer
→ Playback

## Quality levels

64 kbps
128 kbps
256 kbps

Each stream is divided into approximately 4-second chunks.

## Run

Generate HLS:

npm run generate-hls

Start backend:

cd backend
npm run dev

Start frontend:

cd frontend
npm run dev

Open the Vite URL in the browser.

                 USER
                   │
                   │ Open website
                   ▼
          ┌─────────────────┐
          │ Vercel Frontend │
          │   React + Vite  │
          └────────┬────────┘
                   │
                   │ API requests
                   ▼
          ┌─────────────────┐
          │ Render Backend  │
          │ Node + Express  │
          └───────┬─────────┘
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
   ┌─────────────┐  ┌──────────────┐
   │ MongoDB     │  │ HLS Audio    │
   │ Atlas       │  │ Files        │
   │             │  │              │
   │ Metadata    │  │ .m3u8        │
   │             │  │ .ts chunks   │
   └─────────────┘  └──────┬───────┘
                            │
                            ▼
                     master.m3u8
                            │
                            ▼
                         hls.js
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
            64 kbps      128 kbps      256 kbps
               │            │            │
               └────────────┼────────────┘
                            ▼
                       .ts chunks
                            │
                            ▼
                      Browser Buffer
                            │
                            ▼
                       ▶ Playback
                            │
                            ▼
                         🔊 Audio
