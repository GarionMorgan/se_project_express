const router = require("express").Router();
const { NOT_FOUND } = require("../utils/errors");
const { login, createUser } = require("../controllers/users");

const userRouter = require("./users");

const clothingItemRouter = require("./clothingItem");

router.use("/users", userRouter);

router.use("/items", clothingItemRouter);

// login route
router.post("./signin", login);

// registration route
router.post("./signup", createUser);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;
