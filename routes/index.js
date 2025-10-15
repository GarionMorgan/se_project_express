const router = require("express").Router();
const { NOT_FOUND } = require("../utils/errors");
const { login, createUser } = require("../controllers/users");

const userRouter = require("./users");

const clothingItemRouter = require("./clothingItem");

// login route
router.post("/signin", login);

// registration route
router.post("/signup", createUser);

// protected resource routes

router.use("/users", userRouter);

router.use("/items", clothingItemRouter);

// catch all for unknown routes

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;
