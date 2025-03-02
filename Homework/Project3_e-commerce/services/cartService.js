const Cart = require("../models/cartModel");

exports.addToCart = async (userId, productId, quantity) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
    } else {
        cart.items.push({ product: productId, quantity });
    }
    return await cart.save();
};

exports.getCart = async (userId) => {
    return await Cart.findOne({ user: userId }).populate("items.product");
};

exports.removeFromCart = async (userId, productId) => {
    return await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { product: productId } } },
        { new: true }
    );
};

exports.clearCart = async (userId) => {
    return await Cart.findOneAndDelete({ user: userId });
};
