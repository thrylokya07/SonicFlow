# SonicFlow Architecture

## Problem

When a user presses play, modern streaming systems do not wait for the entire audio file to download.

Instead, audio is divided into small chunks.

## SonicFlow flow

MP3
↓
FFmpeg
↓
64 / 128 / 256 kbps
↓
HLS playlist + 4 second chunks
↓
Express streaming server
↓
hls.js
↓
Audio buffer
↓
Playback

## Adaptive bitrate

The player observes:

- Buffer level
- Download speed
- Current quality
- Network condition

If the network becomes slower, the player can move toward a lower bitrate.

If the network improves and enough buffer exists, it can move toward a higher bitrate.

## Cache

The backend maintains a small in-memory LRU cache.

First request:

MISS → disk → response

Later request:

HIT → memory → response

## Network simulator

SonicFlow provides:

- Excellent
- Good
- Slow
- Very Slow

The backend adds artificial delay to demonstrate how streaming reacts to changing network conditions.