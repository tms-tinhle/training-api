const reviewService = require('../services/reviewService');

/**
 * @route POST /products/:id/reviews
 * @desc Thêm đánh giá mới vào sản phẩm.
 */
exports.addReview = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const productId = req.params.id;
        const userId = req.user.id; // Lấy ID user từ token

        const updatedProduct = await reviewService.addReview(productId, userId, rating, review);
        res.status(201).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @route PUT /products/:id/reviews
 * @desc Cập nhật đánh giá của người dùng.
 */
exports.updateReview = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const productId = req.params.id;
        const userId = req.user.id;

        const updatedProduct = await reviewService.updateReview(productId, userId, rating, review);
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @route DELETE /products/:id/reviews
 * @desc Xóa đánh giá của người dùng.
 */
exports.deleteReview = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id;

        const updatedProduct = await reviewService.deleteReview(productId, userId);
        res.json({ message: 'Đánh giá đã được xóa', product: updatedProduct });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @route GET /products/:id/reviews
 * @desc Lấy danh sách đánh giá của sản phẩm.
 */
exports.getReviewsByProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const reviews = await reviewService.getReviewsByProduct(productId);
        res.json(reviews);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
