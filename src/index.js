const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
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

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/signup", signUpRouter);
app.use("/login", loginRouter);
app.use("/passwords", passwordRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on Port: ${PORT}`);
});
