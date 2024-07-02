const express = require("express");
const cartController = require("../controllers/cart.js");
const auth = require("../auth.js");

const { verify, errorHandler } = auth;

const router = express.Router();


// [SECTION] Retrieve Cart Route
router.get("/get-cart", verify, cartController.getCart);


// [SECTION] Add to Cart
router.post("/add-to-cart", verify, cartController.addToCart);


// [SECTION] Update Product Quantity
router.patch("/update-cart-quantity", verify, cartController.updateCartQuantity);


// [SECTION] Remove Products from Cart
router.patch('/:productId/remove-from-cart', verify, cartController.removeFromCart);


// [SECTION] Clear Cart
router.patch('/clear-cart', verify, cartController.clearCart);


module.exports = router;

