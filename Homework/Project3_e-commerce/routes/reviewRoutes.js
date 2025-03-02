const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * @route POST /products/:id/reviews
 * @desc Thêm đánh giá (chỉ user đã đăng nhập).
 */
router.post('/:id/reviews', authenticate, reviewController.addReview);

/**
 * @route PUT /products/:id/reviews
 * @desc Cập nhật đánh giá của chính user.
 */
router.put('/:id/reviews', authenticate, reviewController.updateReview);

/**
 * @route DELETE /products/:id/reviews
 * @desc Xóa đánh giá của chính user.
 */
router.delete('/:id/reviews', authenticate, reviewController.deleteReview);

/**
 * @route GET /products/:id/reviews
 * @desc Lấy danh sách đánh giá của sản phẩm.
 */
router.get('/:id/reviews', reviewController.getReviewsByProduct);

module.exports = router;
