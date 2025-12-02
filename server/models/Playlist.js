import mongoose from "mongoose";

const playlistSongSubschema = new mongoose.Schema(
  {
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
  },
  { _id: false }
);

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    songs: [playlistSongSubschema],
    listenerCount: {
      type: Number,
      default: 0,
    },
    totalPlays: {
      type: Number,
      default: 0,
    },

    // listeners: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },
  },
  {
    timestamps: true,
  }
);

// no duplicate playlists per user
playlistSchema.index({ owner: 1, name: 1 }, { unique: true });

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
