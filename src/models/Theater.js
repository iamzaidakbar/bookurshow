import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
    seatNumber: { type: String, required: true },
    type: { type: String, required: true, enum: ["royalClub", "club", "regular"] },
    price: { type: Number, required: true, enum: [500, 300, 150] },
    status: { type: String, enum: ["available", "booked", "held"], default: "available" }
});

const screenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    seatsLayout: [[seatSchema]],
    totalSeats: { type: Number },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" }
});

const theaterSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        location: { type: String },
        city: { type: String, required: true },
        address: { type: String },
        pincode: { type: String },
        screens: [screenSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Theater", theaterSchema);
