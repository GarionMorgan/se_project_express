const router = require("express").Router();
const User = require("../models/user");
const { getUsers, createUser } = require("../controllers/users");
const mongoose = require("mongoose");

router.get("/", getUsers);
router.get("/:userId", () => {
  console.log("Get user by ID");
});
router.post("/", createUser);

// router.get("/", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.status(200).send(users);
//   } catch (error) {
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// });

// router.get("/:userId", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       return res.status(404).send({ message: "User not found" });
//     }
//     return res.status(200).send(user);
//   } catch (error) {
//     if (error instanceof mongoose.Error.CastError) {
//       return res.status(400).send({ message: "Invalid user ID" });
//     }
//     return res.status(500).send({ message: "Internal Server Error" });
//   }
// });

// router.post("/", async (req, res) => {
//   const { name, about, avatar } = req.body;
//   try {
//     const newUser = await User.create({ name, about, avatar });
//     res.status(201).send(newUser);
//   } catch (error) {
//     if (error instanceof mongoose.Error.ValidationError) {
//       res.status(400).send({ message: "Invalid user data" });
//     } else {
//       res.status(500).send({ message: "Internal Server Error" });
//     }
//   }
// });

module.exports = router;
