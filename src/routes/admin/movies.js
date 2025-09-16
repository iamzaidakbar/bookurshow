import express from "express";
const router = express.Router();

import axios from "axios";
import axiosRetry from "axios-retry";
import { mapGenres } from "../../utils/generateGenres.js";
import Movie from "../../models/Movie.js";
import { fetchMovieVideo } from "../../utils/generateVideos.js";


// Add this **once at the top**, after importing axios:
axiosRetry(axios, {
    retries: 3, // retry 3 times
    retryDelay: (retryCount) => retryCount * 1000, // wait 1s, 2s, 3s between retries
    retryCondition: (error) => axiosRetry.isNetworkError(error) || error.code === "ECONNRESET",
});


// Reusable function to fetch movies from TMDB
async function fetchMovies(category, page = 1) {
    const url = `${process.env.TMDB_BASE_URL}/movie/${category}?language=en-US&page=${page}`;
    const response = await axios.get(url, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
    });

    const movies = response.data.results.map(movie => ({
        ...movie,
        genres: mapGenres(movie.genre_ids),
        genre_ids: undefined
    }));

    return {
        page: Number(page),
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        results: movies,
    };
}

router.get("/movies", async (req, res) => {
    try {
        const movies = await fetchMovies(req.query.category || "now_playing", req.query.page || 1);
        if (!movies) {
            return res.status(404).json({ message: "No movies found" });
        }
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

// Add Movies (single or bulk)
router.post("/movies", async (req, res) => {
    try {
        let movies = req.body;

        if (!movies || (Array.isArray(movies) && movies.length === 0)) {
            return res.status(400).json({ message: "No movies provided" });
        }

        // Wrap single movie into array
        if (!Array.isArray(movies)) movies = [movies];

        const CHUNK_SIZE = 200; // Insert in chunks of 200 to handle large datasets
        let insertedCount = 0;
        let skippedCount = 0;

        // Split into chunks
        for (let i = 0; i < movies.length; i += CHUNK_SIZE) {
            const chunk = movies.slice(i, i + CHUNK_SIZE);

            const enrichedChunk = await Promise.all(chunk.map(async movie => {
                const trailer = await fetchMovieVideo(movie.id);
                return {
                    ...movie,
                    tmdbId: movie.id,
                    poster_path: movie.poster_path
                        ? `${process.env.TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                        : null,
                    backdrop_path: movie.backdrop_path
                        ? `${process.env.TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`
                        : null,
                    video: trailer ? true : false,
                    trailer: `${process.env.YOUTUBE_VIDEO_URL}${trailer || ""}`,
                };
            }));

            // Map chunk: remove duplicates in DB using upsert logic
            const bulkOps = enrichedChunk.map(movie => ({
                updateOne: {
                    filter: { tmdbId: movie.id },
                    update: { $set: movie },
                    upsert: true
                }
            }));

            const result = await Movie.bulkWrite(bulkOps, { ordered: false });

            insertedCount += result.upsertedCount;
            skippedCount += chunk.length - result.upsertedCount;
        }

        res.json({
            message: "Movies processed successfully 🎬",
            totalReceived: movies.length,
            insertedCount,
            skippedCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

export default router;