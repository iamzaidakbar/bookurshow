import express from "express";
import User from "../models/User.js";

const router = express.Router();


// Get current user
router.get("/me", async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Profile loaded successfully 🚀", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

export default router;