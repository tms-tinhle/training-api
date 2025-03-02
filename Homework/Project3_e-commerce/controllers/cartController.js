const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * @route POST /cart
 * @desc Thêm sản phẩm vào giỏ hàng
 * @access Private (User)
 * @param {String} productId - ID sản phẩm
 * @param {Number} quantity - Số lượng sản phẩm
 * @returns {Object} response.cart - Giỏ hàng sau khi thêm
 */
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

        let cart = await Cart.findOne({ user: userId });
        if (!cart) cart = new Cart({ user: userId, items: [] });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity, price: product.price });
        }

        await cart.save();
        res.json({ message: "Sản phẩm đã được thêm vào giỏ hàng", cart });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * @route GET /cart
 * @desc Lấy giỏ hàng của người dùng
 * @access Private (User)
 * @returns {Object} response.cart - Giỏ hàng hiện tại
 */
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name price");
        if (!cart) return res.json({ message: "Giỏ hàng trống" });

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * @route PUT /cart/:id
 * @desc Cập nhật số lượng sản phẩm trong giỏ hàng
 * @access Private (User)
 * @param {String} id - ID sản phẩm trong giỏ hàng
 * @returns {Object} response.cart - Giỏ hàng sau khi cập nhật
 */
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

        const item = cart.items.find(item => item._id.toString() === req.params.id);
        if (!item) return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });

        item.quantity = quantity;
        await cart.save();

        res.json({ message: "Cập nhật giỏ hàng thành công", cart });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * @route DELETE /cart/:id
 * @desc Xóa sản phẩm khỏi giỏ hàng
 * @access Private (User)
 * @param {String} id - ID sản phẩm trong giỏ hàng
 * @returns {Object} response.cart - Giỏ hàng sau khi xóa
 */
exports.removeCartItem = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.id);
        await cart.save();

        res.json({ message: "Đã xóa sản phẩm khỏi giỏ hàng", cart });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
