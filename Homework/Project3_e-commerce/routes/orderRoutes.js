const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate, authorize } = require("../middlewares/authMiddlewares");

/**
 * @route POST /orders
 * @desc Tạo đơn hàng mới
 * @access Private (User)
 */
router.post("/", authenticate, orderController.createOrder);

/**
 * @route GET /orders
 * @desc Lấy danh sách tất cả đơn hàng (Chỉ Admin)
 * @access Private (Admin)
 */
router.get("/", authenticate, authorize(["admin"]), orderController.getAllOrders);

/**
 * @route GET /orders/:id
 * @desc Lấy thông tin đơn hàng theo ID
 * @access Private (Admin hoặc chủ sở hữu đơn hàng)
 */
router.get("/:id", authenticate, orderController.getOrderById);

/**
 * @route PUT /orders/:id
 * @desc Cập nhật trạng thái đơn hàng (Chỉ Admin)
 * @access Private (Admin)
 */
router.put("/:id", authenticate, authorize(["admin"]), orderController.updateOrderStatus);

/**
 * @route DELETE /orders/:id
 * @desc Hủy đơn hàng (Chỉ Admin hoặc chủ sở hữu đơn hàng)
 * @access Private (Admin, User)
 */
router.delete("/:id", authenticate, orderController.cancelOrder);

module.exports = router;
