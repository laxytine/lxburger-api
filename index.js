// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();
require("./passport.js");

// [SECTION] Routes
const userRoutes = require("./routes/user.js");
const productRoutes = require("./routes/product.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");
const seedSuperAdmin = require("./seedSuperAdmin.js");

// [SECTION] Server setup
const app = express();

// [SECTION] Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// [SECTION] Cors Setup
const corsOptions = {
  origin: [
    "http://localhost:4000",
    "http://localhost:3000",
    "https://lxburger.vercel.app",
    "https://lxburger-justines-projects-5350056a.vercel.app/",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(
  session({
    secret: process.env.CLIENTSECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// [SECTION] Database Connection
mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once("open", () =>
  console.log("Now connected to MongoDB Atlas")
);

// [SECTION] Backend Routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// [SECTION] Server Gateway Response
if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`API is now online at ${process.env.PORT || 3000}`);
  });
}

mongoose.connection.once("open", () => {
  seedSuperAdmin();
});

module.exports = { app, mongoose };
