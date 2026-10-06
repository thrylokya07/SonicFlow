const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    songId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    artist: {
      type: String,
      required: true,
      trim: true
    },
    album: {
      type: String,
      default: "Single",
      trim: true
    },
    duration: {
      type: Number,
      default: 30
    },
    genre: {
      type: String,
      default: "General",
      trim: true
    },
    coverUrl: {
      type: String,
      default: ""
    },
    hlsUrl: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.songId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Song", songSchema);