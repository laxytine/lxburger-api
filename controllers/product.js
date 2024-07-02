const Product = require("../models/Product.js");
const {errorHandler} = require('../auth.js');


// [SECTION] Create Product
module.exports.createProduct = async (req, res) => {
    const { name, description, price , imageUrl } = req.body;

    if (!name || !description || !price) {
        return res.status(400).send({ message: 'Please provide all required fields' });
    }

    try {
        // Check for duplicate product
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).send({ message: 'Product with this name already exists' });
        }

        // Create new product
        const newProduct = new Product({
            name,
            description,
            price,
            imageUrl
        });

        const savedProduct = await newProduct.save();
        res.status(201).send({product: savedProduct});
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
};


// [SECTION] Retrieve All Products
module.exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
};

// [SECTION] Retrieve all Active Products
module.exports.getAllActiveProducts = async (req, res) => {
    try {
        const activeProducts = await Product.find({ isActive: true });
        res.status(200).send(activeProducts);
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
};


// [SECTION] Retrieve Single Product
module.exports.getProductById = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
};


// [SECTION] Update Product Info
module.exports.updateProduct = async (req, res) => {
    const { productId } = req.params;
    const { name, description, price, isActive } = req.body;

    try {
        const product = await Product.findByIdAndUpdate(productId, {
            name,
            description,
            price,
            isActive
        }, { new: true });

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        res.status(200).send({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).send({ error: 'Server error', error: error.message });
    }
};


// [SECTION] Archive Product
module.exports.archiveProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true });

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        res.status(200).send({ message: 'Product archived successfully', product });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


// [SECTION] Activate Product
module.exports.activateProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findByIdAndUpdate(productId, { isActive: true }, { new: true });

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        res.status(200).send({ message: 'Product activated successfully', product });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// [SECTION] Add Search for Product by their Names
module.exports.searchByName = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Product name is required.' });
  }

  try {
    const filteredProducts = await Product.find({
      name: { $regex: new RegExp(name, 'i') },
      isActive: true // Filter active products only
    }).sort({ name: 1 }); // Sort by name in ascending order

    if (filteredProducts.length === 0) {
      return res.status(404).json({ message: 'No active products found with the specified name.' });
    }

    res.status(200).json(filteredProducts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};


// [SECTION] Add Search for Product by Price Range
module.exports.searchByPrice = async (req, res) => {
  const { minPrice, maxPrice } = req.body;
  
  if (minPrice === undefined || maxPrice === undefined) {
    return res.status(400).json({ error: 'Minimum and maximum price are required.' });
  }
  if (minPrice > maxPrice) {
    return res.status(400).json({ error: 'Minimum price cannot be greater than maximum price.' });
  }

  try {
    const filteredProducts = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice },
      isActive: true // Filter active products only
    }).sort({ price: 1 });

    if (filteredProducts.length === 0) {
      return res.status(404).json({ message: 'No active products found in the specified price range.' });
    }

    res.status(200).json(filteredProducts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};


