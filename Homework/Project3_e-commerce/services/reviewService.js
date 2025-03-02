const Product = require('../models/Product');

/**
 * Thêm đánh giá vào sản phẩm.
 * @param {String} productId - ID của sản phẩm cần đánh giá.
 * @param {String} userId - ID người dùng đánh giá.
 * @param {Number} rating - Điểm đánh giá (1 - 5 sao).
 * @param {String} review - Nội dung đánh giá.
 * @returns {Object} Sản phẩm sau khi cập nhật đánh giá.
 */
const addReview = async (productId, userId, rating, review) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Sản phẩm không tồn tại');

    // Kiểm tra xem user đã đánh giá sản phẩm này chưa
    const existingReview = product.ratings.find(r => r.user.toString() === userId);
    if (existingReview) throw new Error('Bạn đã đánh giá sản phẩm này rồi');

    product.ratings.push({ user: userId, rating, review });
    await product.save();
    return product;
};

/**
 * Chỉnh sửa đánh giá của người dùng.
 * @param {String} productId - ID sản phẩm.
 * @param {String} userId - ID người dùng.
 * @param {Number} rating - Điểm đánh giá mới.
 * @param {String} review - Nội dung đánh giá mới.
 * @returns {Object} Sản phẩm sau khi cập nhật.
 */
const updateReview = async (productId, userId, rating, review) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Sản phẩm không tồn tại');

    const reviewIndex = product.ratings.findIndex(r => r.user.toString() === userId);
    if (reviewIndex === -1) throw new Error('Bạn chưa đánh giá sản phẩm này');

    product.ratings[reviewIndex].rating = rating;
    product.ratings[reviewIndex].review = review;
    product.ratings[reviewIndex].createdAt = new Date();

    await product.save();
    return product;
};

/**
 * Xóa đánh giá của người dùng.
 * @param {String} productId - ID sản phẩm.
 * @param {String} userId - ID người dùng.
 * @returns {Object} Sản phẩm sau khi cập nhật.
 */
const deleteReview = async (productId, userId) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Sản phẩm không tồn tại');

    product.ratings = product.ratings.filter(r => r.user.toString() !== userId);
    await product.save();
    return product;
};

/**
 * Lấy danh sách đánh giá của một sản phẩm.
 * @param {String} productId - ID sản phẩm.
 * @returns {Array} Danh sách đánh giá.
 */
const getReviewsByProduct = async (productId) => {
    const product = await Product.findById(productId).populate('ratings.user', 'name email');
    if (!product) throw new Error('Sản phẩm không tồn tại');

    return product.ratings;
};

module.exports = {
    addReview,
    updateReview,
    deleteReview,
    getReviewsByProduct
};
