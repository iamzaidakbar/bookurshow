import mongoose from "mongoose";

// 🎟 Seat Schema
const seatSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: [true, "Seat number is required"],
        match: [/^[A-Z]\d+$/, "Seat number must be in format like A1, B12"], // e.g., A1, B2
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["royalClub", "club", "regular"],
    },
    price: {
        type: Number,
        required: true,
        min: [100, "Price must be at least 100"],
        validate: {
            validator: (v) => [500, 300, 150].includes(v), // strict allowed values
            message: "Price must be 500, 300 or 150",
        },
    },
    status: {
        type: String,
        enum: ["available", "booked", "held"],
        default: "available",
    },
});

// 🎬 Screen Schema
const screenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Screen name is required"],
        trim: true,
        minlength: [2, "Screen name must be at least 2 characters long"],
    },
    seatsLayout: {
        type: [[seatSchema]], // 2D array
        validate: {
            validator: function (layout) {
                return Array.isArray(layout) && layout.length > 0;
            },
            message: "Seats layout must have at least one row",
        },
    },
    totalSeats: {
        type: Number,
        min: [1, "Total seats must be at least 1"],
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
    },
});

// Auto-calc totalSeats before saving
screenSchema.pre("validate", function (next) {
    if (this.seatsLayout) {
        this.totalSeats = this.seatsLayout.reduce(
            (sum, row) => sum + row.length,
            0
        );
    }
    next();
});

// 🎭 Theater Schema
const theaterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Theater name is required"],
            trim: true,
            minlength: [2, "Theater name must be at least 2 characters"],
            unique: true,
        },
        location: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        pincode: {
            type: String,
            match: [/^\d{6}$/, "Pincode must be a 6-digit number"], // India-style
            trim: true,
        },
        screens: {
            type: [screenSchema],
            validate: {
                validator: (arr) => arr.length > 0,
                message: "At least one screen is required",
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model("Theater", theaterSchema);
