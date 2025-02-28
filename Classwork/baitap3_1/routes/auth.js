const jwt = require('jsonwebtoken');
require(dotenv.config());

exports.authenticate = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({message: "Khong co token, truy cap bi tu choi"})
    }
    
}
