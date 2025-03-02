const Product = require("../models/productModel");

exports.createProduct = async (data) => {
    return await new Product(data).save();
};

exports.getProducts = async (filters, sort, page = 1, limit = 10) => {
    return await Product.find(filters)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
};

exports.getProductById = async (productId) => {
    return await Product.findById(productId).populate("category");
};

exports.updateProduct = async (productId, updateData) => {
    return await Product.findByIdAndUpdate(productId, updateData, { new: true });
};

exports.deleteProduct = async (productId) => {
    return await Product.findByIdAndDelete(productId);
};
