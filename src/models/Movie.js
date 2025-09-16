import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
    {
        tmdbId: { type: Number, required: true, unique: true },
        title: { type: String, required: true },
        original_title: { type: String, required: true },
        original_language: { type: String, required: true },
        overview: { type: String, required: true },
        adult: { type: Boolean, default: false, required: true },
        video: { type: Boolean, default: false, required: true },
        trailer: { type: String, required: true },
        popularity: { type: Number, required: true },
        vote_average: { type: Number, required: true },
        vote_count: { type: Number, required: true },
        release_date: { type: String, required: true },
        poster_path: { type: String, required: true },
        backdrop_path: { type: String, required: true },
        genres: [{ type: String, required: true }],
    },
    { timestamps: true }
)

export default mongoose.model("Movie", movieSchema);