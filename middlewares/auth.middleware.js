import jwt from "jsonwebtoken";
import Handler from "../utils/handler.js";
// import authService from "../services/auth.service.js"; // Uncomment if needed

const authMiddleware = Handler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: true, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ATSECRETKEY);

        if (!decoded) {
            return res.status(403).json({ error: true, message: "Forbidden: Invalid token" });
        }

        // Optional: Add database user validation (if you want to match your mentor's format)
        // const user = await authService.isValidUser({ id: decoded.id });
        // if (!user) {
        //     return res.status(403).json({ error: true, message: "User no longer exists" });
        // }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: true, message: "Forbidden: Invalid or expired token" });
    }
});

export default authMiddleware;
