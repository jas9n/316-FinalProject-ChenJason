import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 0,
    },
    youtubeId: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listenCount: {
      type: Number,
      default: 0,
    },
    playlistCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// cannot have the same combination of title, artist, year
songSchema.index({ title: 1, artist: 1, year: 1 }, { unique: true });

const Song = mongoose.model("Song", songSchema);

export default Song;
