import jwt from "jsonwebtoken";
import Handler from "../utils/handler.js";
import User from "../models/User.js"; // ✅ Import User model

const authMiddleware = Handler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: true, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ATSECRETKEY);

        if (!decoded || !decoded.id) {
            return res.status(403).json({ error: true, message: "Forbidden: Invalid token" });
        }

        // ✅ Fetch user from DB
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        // ✅ Attach clean user object to req
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
        };

        next();
    } catch (err) {
        return res.status(403).json({ error: true, message: "Forbidden: Invalid or expired token" });
    }
});

export default authMiddleware;
