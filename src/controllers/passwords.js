const passwordRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();
const User = require("../models/user");
const Password = require("../models/password");

// get the token from the request
const getTokenFrom = (request) => {
	const authorization = request.get("authorization");
	if (authorization && authorization.startsWith("Bearer ")) {
		return authorization.replace("Bearer ", "");
	}

	return null;
};

// functions to encrypt and decrypt the password
const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.KEY, "utf8");
const iv = Buffer.from(process.env.IV, "utf8");

const encryptPassword = (password) => {
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(password, "utf8", "hex");
	encrypted += cipher.final("hex");
	return encrypted;
};

const decryptPassword = (encrypted) => {
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(encrypted, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
};

// show all passwords
passwordRouter.get("/", async (req, res, next) => {
	try {
		const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET);
		const user = await User.findById(decodedToken.id).populate("passwords");

		user.passwords.forEach((object) => {
			object.password = decryptPassword(object.password);
		});

		res.status(200).send(user.passwords);
	} catch (error) {
		next(error);
	}
});

// add password to account
passwordRouter.post("/", async (req, res, next) => {
	try {
		const body = req.body;
		const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET);

		const user = await User.findById(decodedToken.id);

		// check if the user already has 20 passwords saved
		if (user.passwords.length >= 20) {
			return res.status(400).send("Maximum password limit reached")
		}

		// encrypt the password
		const encryptedPassword = encryptPassword(body.password);

		const password = new Password({
			website: body.website,
			password: encryptedPassword,
		});

		const savedPassword = await password.save();
		user.passwords = user.passwords.concat(savedPassword._id);
		await user.save();

		res.status(201).send("password saved");
	} catch (error) {
		next(error);
	}
});

passwordRouter.delete("/:id", async (req, res, next) => {
	try {
		const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET);


		const user = await User.findById(decodedToken.id);
		user.passwords = user.passwords.filter(
			(id) => id.toString() !== req.params.id
		);
		await user.save();

		await Password.findByIdAndDelete(req.params.id);

		res.status(204).end();
	} catch (error) {
		next(error);
	}
});

module.exports = passwordRouter;
