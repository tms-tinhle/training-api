const Order = require("../models/orderModel");

exports.createOrder = async (userId, items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = new Order({ user: userId, items, total });
    return await order.save();
};

exports.getOrderById = async (orderId) => {
    return await Order.findById(orderId).populate("user items.product");
};

exports.getUserOrders = async (userId) => {
    return await Order.find({ user: userId }).populate("items.product");
};

exports.updateOrderStatus = async (orderId, status) => {
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
};

exports.deleteOrder = async (orderId) => {
    return await Order.findByIdAndDelete(orderId);
};
