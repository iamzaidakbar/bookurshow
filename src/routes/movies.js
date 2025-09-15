import express from "express";
import axios from "axios";
import axiosRetry from "axios-retry"; // ✅ import axios-retry
import { mapGenres } from "../utils/generateGenres.js";

const router = express.Router();

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

// Now Playing Movies
router.get("/now-playing", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await fetchMovies("now_playing", page);
        res.json({
            message: `Now playing movies fetched successfully 🎬 (page ${page})`,
            ...data,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Upcoming Movies
router.get("/upcoming", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await fetchMovies("upcoming", page);
        res.json({
            message: `Upcoming movies fetched successfully 🎬 (page ${page})`,
            ...data,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

export default router;
