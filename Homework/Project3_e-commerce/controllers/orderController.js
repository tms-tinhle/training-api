const Order = require("../models/Order");

/**
 * @route POST /orders
 * @desc Tạo đơn hàng mới
 * @access Private (User)
 * @param {Array} items - Danh sách sản phẩm đặt hàng (productId, quantity, price)
 * @returns {Object} response.order - Thông tin đơn hàng vừa tạo
 */
exports.createOrder = async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng không được để trống" });
        }

        const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

        const order = new Order({
            user: req.user.id,
            items,
            total
        });

        await order.save();
        res.status(201).json({ message: "Đơn hàng đã được tạo", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * @route GET /orders
 * @desc Lấy danh sách tất cả đơn hàng (chỉ Admin)
 * @access Private (Admin)
 * @returns {Array} response.orders - Danh sách tất cả đơn hàng
 */
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * @route GET /orders/:id
 * @desc Lấy thông tin đơn hàng theo ID
 * @access Private (Admin hoặc chủ sở hữu đơn hàng)
 * @param {String} id - ID của đơn hàng
 * @returns {Object} response.order - Thông tin đơn hàng
 */
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        // Kiểm tra quyền truy cập
        if (req.user.role !== "admin" && req.user.id !== order.user.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập đơn hàng này" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * @route PUT /orders/:id
 * @desc Cập nhật trạng thái đơn hàng (Chỉ Admin)
 * @access Private (Admin)
 * @param {String} id - ID của đơn hàng
 * @param {String} status - Trạng thái mới của đơn hàng (pending, processing, shipped, delivered)
 * @returns {Object} response.order - Đơn hàng sau khi cập nhật
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        order.status = status;
        await order.save();

        res.json({ message: "Trạng thái đơn hàng đã được cập nhật", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * @route DELETE /orders/:id
 * @desc Hủy đơn hàng (Admin hoặc chủ sở hữu đơn hàng)
 * @access Private (Admin, User)
 * @param {String} id - ID của đơn hàng
 * @returns {Object} - Thông báo hủy đơn hàng thành công
 */
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        // Chỉ admin hoặc chủ sở hữu đơn hàng mới có quyền hủy
        if (req.user.role !== "admin" && req.user.id !== order.user.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền hủy đơn hàng này" });
        }

        await order.deleteOne();
        res.json({ message: "Đơn hàng đã được hủy thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};
