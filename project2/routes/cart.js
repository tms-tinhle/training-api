const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Tính toán lại tổng tiền giỏ hàng
const updateCartTotals = async (cart) => {
    await cart.populate('items.product');

    let subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    let tax = subtotal * 0.1;
    let discount = subtotal > 100 ? subtotal * 0.05 : 0;
    let shippingFee = subtotal > 50 ? 0 : 5;
    let grandTotal = subtotal + tax - discount + shippingFee;

    cart.total = subtotal;
    cart.tax = tax;
    cart.discount = discount;
    cart.shippingFee = shippingFee;
    cart.grandTotal = grandTotal;

    await cart.save();
};

// Thêm sản phẩm vào giỏ hàng
router.post('/add', authenticate, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        if (product.stock < quantity) return res.status(400).json({ msg: 'Not enough stock available' });

        let cart = await Cart.findOne({ user: userId });
        if (!cart) cart = new Cart({ user: userId, items: [] });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            let newQuantity = cart.items[itemIndex].quantity + quantity;
            if (newQuantity > product.stock) return res.status(400).json({ msg: 'Not enough stock available' });
            cart.items[itemIndex].quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await updateCartTotals(cart);
        res.json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/update', authenticate, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        if (product.stock < quantity) return res.status(400).json({ msg: 'Not enough stock available' });

        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ msg: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ msg: 'Product not in cart' });

        cart.items[itemIndex].quantity = quantity;
        await updateCartTotals(cart);
        res.json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
