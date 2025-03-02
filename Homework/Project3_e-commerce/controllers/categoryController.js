const Category = require("../models/Category");

/**
 * @route POST /categories
 * @desc Thêm danh mục mới
 * @access Private (Admin)
 * @param {String} name - Tên danh mục
 * @returns {Object} response.category - Danh mục mới
 */
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Kiểm tra danh mục đã tồn tại chưa
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) return res.status(400).json({ message: "Danh mục đã tồn tại" });

        const category = new Category({ name });
        await category.save();

        res.status(201).json({ message: "Danh mục đã được tạo", category });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * @route GET /categories
 * @desc Lấy danh sách danh mục
 * @access Public
 * @returns {Array} response.categories - Danh sách danh mục
 */
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * @route GET /categories/:id
 * @desc Lấy thông tin danh mục theo ID
 * @access Public
 * @param {String} id - ID danh mục
 * @returns {Object} response.category - Thông tin danh mục
 */
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Danh mục không tồn tại" });

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * @route PUT /categories/:id
 * @desc Cập nhật danh mục
 * @access Private (Admin)
 * @param {String} id - ID danh mục
 * @param {String} name - Tên danh mục mới
 * @returns {Object} response.category - Danh mục sau khi cập nhật
 */
exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Danh mục không tồn tại" });

        category.name = name;
        await category.save();

        res.json({ message: "Danh mục đã được cập nhật", category });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * @route DELETE /categories/:id
 * @desc Xóa danh mục
 * @access Private (Admin)
 * @param {String} id - ID danh mục
 * @returns {Object} response.message - Thông báo xóa thành công
 */
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Danh mục không tồn tại" });

        await category.remove();
        res.json({ message: "Danh mục đã được xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
