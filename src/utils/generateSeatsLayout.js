/**
 * Generate seats layout for a screen
 * @param {number[]} seatsPerRow - array of numbers representing seats in each row
 * @param {string[]} seatTypes - array of types in order to assign per row (e.g., ['royalClub', 'club', 'regular'])
 * @param {number[]} prices - corresponding prices for each seat type (e.g., [500, 300, 150])
 * @returns {Array[]} - 2D array compatible with seatsLayout in screenSchema
 */
export function generateSeatsLayout(seatsPerRow, seatTypes = ["royalClub", "club", "regular"], prices = [500, 300, 150]) {
    const layout = [];

    for (let i = 0; i < seatsPerRow.length; i++) {
        const rowSeats = [];
        const rowLetter = String.fromCharCode(65 + i); // A, B, C...
        const type = seatTypes[i % seatTypes.length]; // cycle types if more rows than types
        const price = prices[i % prices.length];

        for (let j = 1; j <= seatsPerRow[i]; j++) {
            rowSeats.push({
                seatNumber: `${rowLetter}${j}`,
                type,
                price
            });
        }

        layout.push(rowSeats);
    }

    return layout;
}
