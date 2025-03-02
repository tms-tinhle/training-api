const Product = require("../models/Product");

/**
 * @route POST /products
 * @desc Tạo sản phẩm mới
 * @access Private (Admin)
 * @param {String} name - Tên sản phẩm
 * @param {Number} price - Giá sản phẩm
 * @param {String} description - Mô tả sản phẩm
 * @param {String} category - ID danh mục sản phẩm
 * @param {Number} stock - Số lượng tồn kho
 * @returns {Object} response.product - Sản phẩm vừa tạo
 */
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;

        const product = new Product({ name, price, description, category, stock });
        await product.save();

        res.status(201).json({ message: "Sản phẩm đã được tạo", product });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * @route GET /products
 * @desc Lấy danh sách sản phẩm
 * @access Public
 * @returns {Array} response.products - Danh sách sản phẩm
 */
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category", "name");
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * @route GET /products/:id
 * @desc Lấy thông tin sản phẩm theo ID
 * @access Public
 * @param {String} id - ID sản phẩm
 * @returns {Object} response.product - Chi tiết sản phẩm
 */
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "name");
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * @route PUT /products/:id
 * @desc Cập nhật sản phẩm
 * @access Private (Admin)
 * @param {String} id - ID sản phẩm
 * @returns {Object} response.product - Sản phẩm sau khi cập nhật
 */
exports.updateProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;
        const product = await Product.findByIdAndUpdate(req.params.id, { name, price, description, category, stock }, { new: true });

        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        res.json({ message: "Sản phẩm đã được cập nhật", product });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * @route DELETE /products/:id
 * @desc Xóa sản phẩm
 * @access Private (Admin)
 * @param {String} id - ID sản phẩm
 * @returns {Object} - Thông báo xóa sản phẩm thành công
 */
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        res.json({ message: "Sản phẩm đã bị xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};
