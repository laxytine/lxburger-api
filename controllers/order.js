const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");
const { errorHandler } = require('../auth.js');

// [SECTION] Create Order
module.exports.createOrder = async (req, res) => {
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        if (cart.cartItems.length === 0) {
            return res.status(400).json({ error: 'No items to checkout' });
        }

        const newOrder = new Order({
            userId,
            productsOrdered: cart.cartItems,
            totalPrice: cart.totalPrice,
            status: 'success'
        });

        await newOrder.save();

        cart.cartItems = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(200).json({
            message: 'Ordered successfully',
            order: newOrder
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// [SECTION] Retrieve Logged In User's Order
module.exports.getUserOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const orders = await Order.find({ userId });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// [SECTION] Retrieve All User's Order
module.exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
