const crypto = require("crypto");
const User = require("../models/User");
const SECRET_KEY = process.env.SECRET_KEY;

async function authenticate(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        // Tìm user có token này
        const user = await User.findOne({ token });
        if (!user || !user.tokenExpiresAt || user.tokenExpiresAt < new Date()) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Kiểm tra token có hợp lệ không
        const expectedPayload = `${user.username}|${user.tokenExpiresAt.getTime()}`;
        const expectedToken = crypto.createHmac("sha256", SECRET_KEY)
            .update(expectedPayload)
            .digest("hex");
            console.log("Received token:", token);
            console.log("Expected token:", expectedToken);

        if (token !== expectedToken) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


module.exports = authenticate;
