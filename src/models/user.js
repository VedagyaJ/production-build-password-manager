const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		maxLength: 32,
	},
	password: {
		type: String,
		required: true,
	},
	passwords: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Password",
		},
	],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
