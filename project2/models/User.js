const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    isVerified: { type: Boolean, default: false }, // Xác thực email
    resetToken: String, // Token đặt lại mật khẩu
    resetTokenExpires: Date, // Hạn sử dụng resetToken
    verifyToken: String, // Token xác thực email
    verifyTokenExpires: Date, // Hạn sử dụng verifyToken
    token: String // Token đăng nhập
}, { timestamps: true });

// Hàm băm mật khẩu
userSchema.methods.hashPassword = function(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Middleware mã hóa mật khẩu trước khi lưu
userSchema.pre('save', function(next) {
    if (this.isModified('password') && !this.password.startsWith('$SHA$')) {
        this.password = `$SHA$${this.hashPassword(this.password)}`;
    }
    next();
});

// Hàm kiểm tra mật khẩu
userSchema.methods.checkPassword = function(password) {
    return this.password === `$SHA$${this.hashPassword(password)}`;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
