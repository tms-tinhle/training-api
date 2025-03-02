const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    stock: Number,
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Người dùng đánh giá
        rating: { type: Number, required: true, min: 1, max: 5 }, // Điểm đánh giá từ 1 đến 5 sao
        review: String, // Nội dung đánh giá
        createdAt: { type: Date, default: Date.now } // Thời gian đánh giá
    }]
});

module.exports = mongoose.model('Product', productSchema);
