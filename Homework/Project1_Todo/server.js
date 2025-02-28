const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use("/api/auths", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port 3000"));
