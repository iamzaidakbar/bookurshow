export default function isAdmin(req, res, next) {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized, token missing or invalid" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied, admin only" });
        }

        next();
    } catch (err) {
        next(err);
    }
}
