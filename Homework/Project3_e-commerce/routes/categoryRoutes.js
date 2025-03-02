const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middlewares/authMiddlewares");

/**
 * @route POST /categories
 * @desc Thêm danh mục mới
 * @access Private (Admin)
 */
router.post("/", authenticate, authorize(["admin"]), categoryController.createCategory);

/**
 * @route GET /categories
 * @desc Lấy danh sách danh mục
 * @access Public
 */
router.get("/", categoryController.getCategories);

/**
 * @route GET /categories/:id
 * @desc Lấy thông tin danh mục theo ID
 * @access Public
 */
router.get("/:id", categoryController.getCategoryById);

/**
 * @route PUT /categories/:id
 * @desc Cập nhật danh mục
 * @access Private (Admin)
 */
router.put("/:id", authenticate, authorize(["admin"]), categoryController.updateCategory);

/**
 * @route DELETE /categories/:id
 * @desc Xóa danh mục
 * @access Private (Admin)
 */
router.delete("/:id", authenticate, authorize(["admin"]), categoryController.deleteCategory);

module.exports = router;
