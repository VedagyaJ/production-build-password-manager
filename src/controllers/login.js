const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const loginRouter = require("express").Router();
const User = require("../models/user");

// get the token from the request
const getTokenFrom = (request) => {
	const authorization = request.get("authorization");
	if (authorization && authorization.startsWith("Bearer ")) {
		return authorization.replace("Bearer ", "");
	}

	return null;
};

// used to validate the token
loginRouter.get("/auth/token", async (req, res, next) => {
	try {
		const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET);
		if (decodedToken.id) {
			res.status(200).send("valid token");
		}
	} catch (error) {
		next(error);
	}
});

loginRouter.post("/", async (req, res, next) => {
	try {
		const { username: name, password } = req.body;

		const user = await User.findOne({ name });
		const passwordCorrect =
			user === null
				? false
				: await bcrypt.compare(password, user.password);

		if (!(user && passwordCorrect)) {
			return res.status(401).json({
				error: "invalid username or password",
			});
		}

		const userForToken = {
			username: user.name,
			id: user._id,
		};

		const token = jwt.sign(userForToken, process.env.SECRET, {
			expiresIn: 60 * 60,
		});

		res.status(200).send({ token, username: user.name });
	} catch (error) {
		next(error);
	}
});

module.exports = loginRouter;
