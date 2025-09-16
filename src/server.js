import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import config from "config";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import moviesRoutes from "./routes/movies.js";
import adminMoviesRoutes from "./routes/admin/movies.js";
import adminTheaterRoutes from "./routes/admin/theater.js";

import authMiddleware from "./midleware/authMiddleware.js";
import isAdmin from "./midleware/isAdmin.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", authMiddleware, profileRoutes);
app.use("/api/movies", authMiddleware, moviesRoutes);
app.use("/api/admin", authMiddleware, isAdmin, adminMoviesRoutes);
app.use("/api/admin", authMiddleware, isAdmin, adminTheaterRoutes);

// DB Connection
const mongoURI = process.env.MONGO_URI || config.get("mongoURI");
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
