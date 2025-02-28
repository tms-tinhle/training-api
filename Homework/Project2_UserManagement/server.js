const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const connection = require("./config/MongoDB");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

connection();

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port 3000"));
