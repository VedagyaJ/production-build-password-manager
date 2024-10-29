const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const signUpRouter = require("express").Router();
const User = require("../models/user");

signUpRouter.post("/", async (req, res, next) => {
	try {
		const { username: name, password } = req.body;

		// check if user already exists in the database
		const existingUser = await User.findOne({ name });
		if (existingUser) {
			return res
				.status(422)
				.send(
					"User already exists. Please choose a different username."
				);
		}

		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		const user = new User({
			name,
			password: passwordHash,
		});

		const savedUser = await user.save();

		const userForToken = {
			username: savedUser.name,
			id: savedUser._id,
		};

		const token = jwt.sign(userForToken, process.env.SECRET, {
			expiresIn: 60*60,
		});

		res.status(200).send({ token, username: user.name });
	} catch (error) {
		next(error);
	}
});

module.exports = signUpRouter;
