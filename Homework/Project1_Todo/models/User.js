const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true 
    },
    hashedPassword: { 
        type: String, 
        required: true 
    },
    salt: { 
        type: String, 
        required: true 
    },
    token: { 
        type: String, 
        default: null  // Lưu token để kiểm tra đăng nhập
    },
    tokenExpiresAt: { 
        type: Date, 
        default: null  // Thời gian hết hạn token
    }
});

// Hàm mã hóa mật khẩu
userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hashedPassword = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
};

// Hàm kiểm tra mật khẩu
userSchema.methods.validatePassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
    return this.hashedPassword === hash;
};

module.exports = mongoose.model("User", userSchema);
