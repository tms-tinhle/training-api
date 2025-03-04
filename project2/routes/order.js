const express = require('express');
const router = express.Router();
const { authenticate, adminAuth } = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../middleware/sendMail');

// Tạo đơn hàng từ giỏ hàng
// Tạo đơn hàng từ giỏ hàng
router.post('/create', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { selectedItems } = req.body; // Danh sách productId mà user muốn đặt hàng

        let cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ msg: 'Your cart is empty' });
        }

        let updatedItems = [];
        for (let item of cart.items) {
            if (selectedItems.includes(item.product._id.toString())) {
                let availableStock = item.product.qty; // Số lượng hàng còn trong kho

                if (!availableStock || availableStock <= 0) {
                    return res.status(400).json({ msg: `Product "${item.product.name}" is out of stock` });
                }

                let quantityToOrder = Math.min(item.quantity, availableStock);

                if (!quantityToOrder || quantityToOrder <= 0) {
                    return res.status(400).json({ msg: `Invalid quantity for product ${item.product.name}` });
                }

                updatedItems.push({
                    product: item.product._id,
                    quantity: quantityToOrder,
                    price: item.product.price
                });

                // Giảm số lượng trong kho
                await Product.findByIdAndUpdate(item.product._id, { $inc: { qty: -quantityToOrder } });
            }
        }

        if (updatedItems.length === 0) {
            return res.status(400).json({ msg: 'No valid products selected' });
        }

        // Tính tổng tiền
        let total = 0;
        for (let item of updatedItems) {
            if (!item.quantity || !item.price) {
                return res.status(400).json({ msg: `Invalid quantity or price for product ${item.product}` });
            }
            total += item.quantity * item.price;
        }

        let tax = total * 0.1;
        let discount = total > 100 ? total * 0.05 : 0;
        let shippingFee = total > 50 ? 0 : 5;
        let grandTotal = total + tax - discount + shippingFee;

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: userId,
            items: updatedItems,
            total: grandTotal
        });

        await newOrder.save();

        // Cập nhật lại giỏ hàng (xóa sản phẩm đã đặt)
        cart.items = cart.items.filter(item => !selectedItems.includes(item.product._id.toString()));
        await cart.save();

        // Gửi email cho admin
        const adminEmail = process.env.SMTP_USER; //mail admin
        const userEmail = req.user.email; // mail của user
        const emailSubject = 'New Order Received';
        const emailText = `User ${req.user.name} has placed an order. Order ID: ${newOrder._id}. Total: ${grandTotal} VND`;

        await sendEmail(adminEmail, emailSubject, emailText);
        await sendEmail(userEmail, 'Order Confirmation', `Thank you for your order! Your order ID: ${newOrder._id}`);

        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});



// Xác nhận đơn hàng
router.put('/confirm/:id', authenticate, adminAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });
        if (order.status !== 'pending') {
            return res.status(400).json({ msg: 'Order cannot be confirmed' });
        }
        order.status = 'processing';
        await order.save();
        res.json({ msg: 'Order confirmed', order });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Huỷ đơn hàng
router.put('/cancel/:id', authenticate, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });
        if (order.status !== 'pending') {
            return res.status(400).json({ msg: 'Only pending orders can be canceled' });
        }

        // Hoàn lại số lượng hàng vào kho
        for (let item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }

        order.status = 'canceled';
        await order.save();
        res.json({ msg: 'Order canceled', order });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Xem danh sách đơn hàng
router.get('/my-orders', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Xem chi tiết đơn hàng
router.get('/:id', authenticate, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) return res.status(404).json({ msg: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Admin cập nhật trạng thái đơn hàng
router.put('/update-status/:id', authenticate, adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatus = ['processing', 'shipped', 'delivered', 'canceled'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        if (order.status === 'canceled' || order.status === 'delivered') {
            return res.status(400).json({ msg: 'Cannot update a canceled or delivered order' });
        }

        order.status = status;
        await order.save();
        res.json({ msg: `Order updated to ${status}`, order });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
