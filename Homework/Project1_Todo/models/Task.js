const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    },
    dueDate: { 
        type: Date,
        validate: {
            validator: function(value) {
                return !isNaN(Date.parse(value)); // Kiểm tra ngày hợp lệ
            },
            message: "Invalid dueDate format (ISO 8601 expected)"
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
// Tạo index text cho title và description
todoSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model('Todo', todoSchema);