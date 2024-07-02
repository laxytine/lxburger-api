const mongoose = require("mongoose");

//[SECTION] Schema/Blueprint

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User ID is Required"],
  },
  productsOrdered: [
    {
      productId: {
        type: String,
        required: [true, "Product ID is Required"],
      },
      productName: {
        type: String,
        required: [true, "Product Name is Required"],
      },
      quantity: {
        type: Number,
        required: [true, "Quantity is Required"],
      },
      subtotal: {
        type: Number,
        required: [true, "Subtotal is Required"],
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: [true, "Total Price is Required"],
  },
  orderedOn: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "Pending",
  },
});

module.exports = mongoose.model("Order", orderSchema);
