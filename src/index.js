const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const middleware = require("./utils/middleware");
const loginRouter = require("./controllers/login");
const signUpRouter = require("./controllers/signup");
const passwordRouter = require("./controllers/passwords");

const app = express();

const uri = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

mongoose
	.connect(uri)
	.then(() => {
		console.log("connected to MongoDB");
	})
	.catch((error) => console.log("error connecting to MongoDB"));

app.use(express.static(path.resolve(__dirname, "../dist")));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/signup", signUpRouter);
app.use("/login", loginRouter);
app.use("/passwords", passwordRouter);

// Catch-all route to serve index.html for React Router
app.get("*", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on Port: ${PORT}`);
});
