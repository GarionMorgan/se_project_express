const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  OK,
  CREATED,
  DUPLICATE_KEY_ERROR,
  CONFLICT,
  UNAUTHORIZED_ERROR,
} = require("../utils/errors");

const { JWT_SECRET } = require("../utils/config");

// Get /users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch(() =>
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" })
    );
};
// create /users
const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10) // hash with 10 salt rounds
    .then((hashedPassword) => {
      User.create({
        name,
        avatar,
        email,
        password: hashedPassword,
      });
    })
    .then((newUser) => {
      // exclude password
      const {
        _id,
        name: Username,
        avatar: userAvatar,
        email: userEmail,
      } = newUser;
      res
        .status(CREATED)
        .send({ _id, name: Username, avatar: userAvatar, email: userEmail });
    })
    .catch((err) => {
      if (err.code === DUPLICATE_KEY_ERROR) {
        return res.status(CONFLICT).send({ message: "Email already exists" });
      }
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

// get /users/:userId
const getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      const error = new Error("User not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid user ID" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      if (err.statusCode) {
        return res
          .status(err.statusCode)
          .send({ message: "An error has occurred" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch(() => {
      res
        .status(UNAUTHORIZED_ERROR)
        .send({ message: "Invalid email or password" });
    });
};

module.exports = { getUsers, createUser, getUserById, login };
