const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
    const authorization = req.get("authorization") || "";
    const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : "";

    if (!token || !process.env.JWT_SECRET) {
        return res.status(401).json({ message: "Authentication required." });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ userid: Number(payload.sub) });

        if (!user || (user.tokenVersion || 0) !== payload.version) {
            return res.status(401).json({ message: "Session expired. Please sign in again." });
        }

        req.user = user;
        return next();
    } catch (_error) {
        return res.status(401).json({ message: "Session expired. Please sign in again." });
    }
};

module.exports = authenticate;