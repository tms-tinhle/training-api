const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticate, authorize } = require("../middlewares/authMiddlewares");

/**
 * @route POST /products
 * @desc Tạo sản phẩm mới
 * @access Private (Admin)
 */
router.post("/", authenticate, authorize(["admin"]), productController.createProduct);

/**
 * @route GET /products
 * @desc Lấy danh sách sản phẩm
 * @access Public
 */
router.get("/", productController.getAllProducts);

/**
 * @route GET /products/:id
 * @desc Lấy thông tin sản phẩm theo ID
 * @access Public
 */
router.get("/:id", productController.getProductById);

/**
 * @route PUT /products/:id
 * @desc Cập nhật sản phẩm
 * @access Private (Admin)
 */
router.put("/:id", authenticate, authorize(["admin"]), productController.updateProduct);

/**
 * @route DELETE /products/:id
 * @desc Xóa sản phẩm
 * @access Private (Admin)
 */
router.delete("/:id", authenticate, authorize(["admin"]), productController.deleteProduct);

module.exports = router;
