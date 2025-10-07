const { verify } = require("../utils/jwt");
module.exports = (roles = []) => {
    return (req, res, next) => {
        try {
            const auth = req.headers.authorization || ""; // Bearer xx
            const token = auth.split(" ")[1];
            if (!token) return res.status(401).json({ message: "No token" });
            const decoded = verify(token);
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Forbidden" });
            }
            req.user = decoded; // { id, role }
            next();
        } catch (e) {
            return res.status(401).json({ message: "Invalid token" });
        }
    };
};