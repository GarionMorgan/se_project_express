const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  OK,
  CREATED,
} = require("../utils/errors");

//Get /users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch((err) =>
      res.status(INTERNAL_SERVER_ERROR).send({ message: err.message })
    );
};
//create /users
const createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((newUser) => res.status(CREATED).send(newUser))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      } else if (err.statusCode) {
        // If a specific statusCode was attached earlier (e.g. .orFail), forward it
        return res.status(err.statusCode).send({ message: err.message });
      } else {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};
//get /users/:userId
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
      } else if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      } else if (err.statusCode) {
        return res.status(err.statusCode).send({ message: err.message });
      } else {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};

module.exports = { getUsers, createUser, getUserById };
