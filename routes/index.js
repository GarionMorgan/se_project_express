const router = require("express").Router();
const { login, createUser } = require("../controllers/users");
const NotFoundError = require("../errors/NotFoundError");

const userRouter = require("./users");

const clothingItemRouter = require("./clothingItem");
const {
  validateAuthentication,
  validateUserBody,
} = require("../middlewares/validation");

// login route
router.post("/signin", validateAuthentication, login);

// registration route
router.post("/signup", validateUserBody, createUser);

// protected resource routes

router.use("/users", userRouter);

router.use("/items", clothingItemRouter);

// catch all for unknown routes

router.use(() => {
  throw new NotFoundError("Requested resource not found");
});

module.exports = router;
