const mongoose = require('mongoose');

//[SECTION] Schema/Blueprint

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Product Name is Required']
	},
	description: {
		type: String,
		required: [true, 'Decription is Required']
	},
	price: {
		type: Number,
		required: [true, 'Price is Required']
	},
	isActive: {
		type: Boolean,
		default: true
	},
	imageUrl: {
		type: String,
		default: "https://dash-bootstrap-components.opensource.faculty.ai/static/images/placeholder286x180.png"
	},
	createdOn: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('Product', productSchema);