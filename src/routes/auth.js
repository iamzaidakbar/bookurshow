import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "config";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { name, email, password, role = "user" } = req.body;
    try {
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // save user
        let user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        // remove password before sending back
        const safeUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // generate token
        const token = jwt.sign({ id: user._id, role: user.role }, config.get("jwtSecret"), {
            expiresIn: "1h"
        });

        // set cookie and respond
        res.cookie("token", token, { httpOnly: true });
        res.json({
            message: "User registered successfully",
            user: safeUser,
            token
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, config.get("jwtSecret"), { expiresIn: "1h" });

        const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role }

        res.cookie("token", token, { httpOnly: true });
        res.json({ message: "Login successful", token, user: safeUser });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// Logout
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});


export default router;
