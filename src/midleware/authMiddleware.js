import jwt from "jsonwebtoken";
import config from "config";
import User from "../models/User.js";

export default async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}
