const mongoose = require("mongoose");
const passwordSchema = new mongoose.Schema({
	website: {
		type: String,
		required: true,
		maxLength: 32,
	},
	password: {
		type: String,
		required: true,
		maxLength: 256,
	},
});

module.exports = mongoose.model("Password", passwordSchema);
