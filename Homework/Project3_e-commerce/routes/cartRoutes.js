const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticate } = require("../middlewares/authMiddlewares");

/**
 * @route POST /cart
 * @desc Thêm sản phẩm vào giỏ hàng
 * @access Private (User)
 */
router.post("/", authenticate, cartController.addToCart);

/**
 * @route GET /cart
 * @desc Lấy giỏ hàng của người dùng
 * @access Private (User)
 */
router.get("/", authenticate, cartController.getCart);

/**
 * @route PUT /cart/:id
 * @desc Cập nhật số lượng sản phẩm trong giỏ hàng
 * @access Private (User)
 */
router.put("/:id", authenticate, cartController.updateCartItem);

/**
 * @route DELETE /cart/:id
 * @desc Xóa sản phẩm khỏi giỏ hàng
 * @access Private (User)
 */
router.delete("/:id", authenticate, cartController.removeCartItem);

module.exports = router;
