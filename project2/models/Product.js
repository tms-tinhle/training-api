const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    sku: String,
    price: Number,
    qty: Number,
    thumbnail: String,
    image: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;