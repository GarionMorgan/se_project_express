const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user");
const { OK, CREATED } = require("../utils/errors");
const UnauthorizedError = require("../errors/UnauthorizedError");
const NotFoundError = require("../errors/NotFoundError");

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
    throw new UnauthorizedError("User not authenticated");
  }

  const user = await User.findById(userId).orFail(() => {
    throw new NotFoundError("User not found");
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
    throw new NotFoundError("User not found");
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
