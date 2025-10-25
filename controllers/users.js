const asyncHandler = require("../utils/asyncHandler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  NOT_FOUND,
  OK,
  CREATED,
  UNAUTHORIZED_ERROR,
} = require("../utils/errors");

const { JWT_SECRET } = require("../utils/config");

// POST /signup
const createUser = asyncHandler(async (req, res) => {
  const { name, avatar, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10); // hash with 10 salt rounds

  const newUser = await User.create({
    name,
    avatar,
    email,
    password: hashedPassword,
  });

  const { _id, name: username, avatar: userAvatar, email: userEmail } = newUser;
  res
    .status(CREATED)
    .send({ _id, name: username, avatar: userAvatar, email: userEmail });
});

// GET /users/me
const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    const err = new Error("User not authenticated");
    err.statusCode = UNAUTHORIZED_ERROR;
    throw err;
  }

  const user = await User.findById(userId).orFail(() => {
    const err = new Error("User not found");
    err.statusCode = NOT_FOUND;
    throw err;
  });
  res.send(user);
});

// PATCH /users/me
const updateCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { name, avatar } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  ).orFail(() => {
    const err = new Error("User not found");
    err.statusCode = NOT_FOUND;
    throw err;
  });

  res.send(updatedUser);
});

// POST /signin
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findUserByCredentials(email, password);

  const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.status(OK).send({ token });
});

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateCurrentUser,
};
