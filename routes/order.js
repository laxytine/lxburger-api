const express = require("express");
const orderController = require("../controllers/order.js");
const auth = require("../auth.js");

const { verify, verifyAdmin, errorHandler } = auth;

const router = express.Router();


// [SECTION] Create Order
router.post('/checkout', verify, orderController.createOrder);


// [SECTION] Retrieve Logged In User's Order
router.get('/my-orders', verify, orderController.getUserOrders);


// [SECTION] Retrieve All User's Order
router.get('/all-orders', verify, verifyAdmin, orderController.getAllOrders);


module.exports = router;