import express from "express";
import Movie from "../models/Movie.js";

const router = express.Router();



// Now Playing Movies
router.get("/now-playing", async (req, res) => {
    try {
        const movies = await Movie.find().sort({ releaseDate: -1 }).limit(20);
        if (!movies || movies.length === 0) {
            return res.status(404).json({ message: "No movies found" });
        }
        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});





export default router;
