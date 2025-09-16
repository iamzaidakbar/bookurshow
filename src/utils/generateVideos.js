import axios from "axios";

// Fetch video for a specific movie by TMDB ID
export async function fetchMovieVideo(tmdbId) {
    const url = `${process.env.TMDB_BASE_URL}/movie/${tmdbId}/videos?language=en-US`;

    try {
        const response = await axios.get(url, {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
            },
        });

        const videos = response.data.results;

        if (!videos || videos.length === 0) {
            return null;
        }

        // Prefer the official trailer if available
        const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube") || videos[0];
        return trailer.key;
    } catch (err) {
        console.error(`Failed to fetch video for movie ${tmdbId}:`, err.message);
        return null;
    }
}
