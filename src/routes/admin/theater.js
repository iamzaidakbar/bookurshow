import express from "express";
import Theater from "../../models/Theater.js";
import { generateSeatsLayout } from "../../utils/generateSeatsLayout.js";

const router = express.Router();

// Helper to ensure each screen has seats
function prepareScreens(screens) {
    return screens.map(screen => {
        if (!screen.seatsLayout) {
            // Example: 10 rows with 10 seats each = 100 seats
            screen.seatsLayout = generateSeatsLayout([10, 10, 10, 12, 12, 12, 12, 15, 15, 15]);
            screen.status = screen.status || "inactive";
        }
        return screen;
    });
}

// Create a new theater
router.post("/theaters", async (req, res) => {
    try {
        const existingTheater = await Theater.findOne({ name: req.body.name });
        if (existingTheater) {
            return res.status(400).send({ message: "Theater already exists" });
        }

        // Prepare screens with seats
        const screens = prepareScreens(req.body.screens || []);
        const theater = new Theater({ ...req.body, screens });
        await theater.save();

        res.status(201).send(theater);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Bulk add theaters
router.post("/theaters/bulk", async (req, res) => {
    try {
        const names = req.body.map(t => t.name);

        // Find already existing theaters
        const existingTheaters = await Theater.find({ name: { $in: names } });
        const existingNames = existingTheaters.map(t => t.name);

        // Filter out theaters that already exist
        const newTheaters = req.body
            .filter(t => !existingNames.includes(t.name))
            .map(t => ({
                ...t,
                screens: prepareScreens(t.screens || [])
            }));

        if (newTheaters.length === 0) {
            return res.status(400).send({ message: "All theaters already exist" });
        }

        const theaters = await Theater.insertMany(newTheaters);
        res.status(201).send({
            inserted: theaters.length,
            skipped: existingNames,
        });
    } catch (error) {
        res.status(400).send(error);
    }
});


// Get all theaters
router.get("/theaters", async (req, res) => {
    try {
        const theaters = await Theater.find({});
        res.send(theaters);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get Theater by ID
router.get("/theaters/:id", async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        if (!theater) {
            return res.status(404).send();
        }
        res.send(theater);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a Theater
router.patch("/theaters/:id", async (req, res) => {
    try {
        const theater = await Theater.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!theater) {
            return res.status(404).send();
        }
        res.send(theater);
    } catch (error) {
        res.status(400).send(error);
    }
});

export default router;
