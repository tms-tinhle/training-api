const express = require('express');
const router = express.Router();
const { authenticate, adminAuth } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Lấy danh sách user (Admin only)
router.get('/users', authenticate, adminAuth, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});
router.put('/confirm/:id', authenticate, adminAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user');
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        if (order.status !== 'pending') {
            return res.status(400).json({ msg: 'Order cannot be confirmed' });
        }

        order.status = 'processing';
        await order.save();

        // Gửi email thông báo cho user
        const userEmail = order.user.email;
        await sendEmail(userEmail, 'Order Confirmed', `Your order ${order._id} is now being processed.`);

        res.json({ msg: 'Order confirmed', order });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});


module.exports = router;
