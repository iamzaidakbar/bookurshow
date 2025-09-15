import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
    {
        tmdbId: { type: Number, required: true, unique: true },
        title: { type: String, required: true },
        originalTitle: { type: String, required: true },
        originalLanguage: { type: String, required: true },
        overview: { type: String, required: true },
        adult: { type: Boolean, default: false, required: true },
        video: { type: Boolean, default: false, required: true },
        popularity: { type: Number, required: true },
        voteAverage: { type: Number, required: true },
        voteCount: { type: Number, required: true },
        releaseDate: { type: String, required: true },
        posterPath: { type: String, required: true },
        backdropPath: { type: String, required: true },
        genres: [{ type: String, required: true }],
    },
    { timestamps: true }
)

export default mongoose.model("Movie", movieSchema);