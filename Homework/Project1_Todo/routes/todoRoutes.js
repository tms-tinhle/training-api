const express = require("express");
const { getTodos, createTodo, updateTodo, deleteTodo } = require("../controllers/todoController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getTodos);
router.post("/", authenticate, createTodo);
router.put("/:id", authenticate, updateTodo);
router.delete("/:id", authenticate, deleteTodo);

module.exports = router;
