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
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port 3000"));
