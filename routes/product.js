const express = require("express");
const productController = require("../controllers/product.js")
const auth = require("../auth.js");

const {verify, verifyAdmin} = auth;

//[SECTION] Routing Component
const router = express.Router();



// [SECTION] Create Product
router.post('/', verify, verifyAdmin, productController.createProduct);


// [SECTION] Retrieve All Products
router.get('/all', verify, verifyAdmin, productController.getAllProducts);


// [SECTION] Retrieve all Active Products
router.get('/active', productController.getAllActiveProducts);


// [SECTION] Retrieve Single Product
router.get('/:productId', productController.getProductById);


// [SECTION] Update Product Info
router.patch('/:productId/update', verify, verifyAdmin, productController.updateProduct);


// [SECTION] Archive Product
router.patch('/:productId/archive', verify, verifyAdmin, productController.archiveProduct);


// [SECTION] Activate Product
router.patch('/:productId/activate', verify, verifyAdmin, productController.activateProduct);


// [SECTION] Add Search for Product by their Names
router.post('/search-by-name', productController.searchByName);


// [SECTION] Add Search for Product by Price Range
router.post('/search-by-price', productController.searchByPrice);



module.exports = router; 