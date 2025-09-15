import { genresList } from "../constants.js";

// Convert genre_ids to genre names
export function mapGenres(genre_ids) {
    return genre_ids.map(id => {
        const genre = genresList.find(g => g.id === id);
        return genre ? genre.name : null;
    }).filter(Boolean); // remove nulls if any
}