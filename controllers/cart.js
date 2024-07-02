const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
const { errorHandler, verify } = require("../auth.js");

// [SECTION] Retrieve Cart
module.exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    res.status(200).send({ cart: cart });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// [SECTION] Add to Cart
module.exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, productName, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        cartItems: [],
        totalPrice: 0,
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const subtotal = quantity * product.price;

    const cartItemIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (cartItemIndex !== -1) {
      cart.cartItems[cartItemIndex].quantity += quantity;
      cart.cartItems[cartItemIndex].subtotal += subtotal;
    } else {
      cart.cartItems.push({ productId, productName, quantity, subtotal });
    }

    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Item added successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating the cart",
      error: error.message,
    });
  }
};

// [SECTION] Update Product Quantity
module.exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    const subtotal = quantity * product.price;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    const cartItems = cart.cartItems.findIndex(
      (item) => item.productId === productId
    );

    if (cartItems !== -1) {
      cart.cartItems[cartItems].quantity = quantity;
      cart.cartItems[cartItems].subtotal = subtotal;
    } else {
      cart.cartItems.push({ productId, quantity, subtotal });
    }

    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    await cart.save();

    res
      .status(200)
      .send({ message: "Item quantity updated successfully", cart });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// [SECTION] Remove Products from Cart
module.exports.removeFromCart = async (req, res) => {
  const userId = req.user.id; // Extracted from the verifyToken middleware
  const { productId } = req.params;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const cartItemIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    cart.cartItems.splice(cartItemIndex, 1);

    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while removing the product from cart",
      error: error.message,
    });
  }
};

// [SECTION] Clear Cart
module.exports.clearCart = async (req, res) => {
  const userId = req.user.id; // Extracted from the verifyToken middleware

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    if (cart.cartItems.length === 0) {
      return res.status(400).json({ error: "No items in the cart to clear" });
    }

    cart.cartItems = [];
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      error: "Server error",
      error: error.message,
    });
  }
};
