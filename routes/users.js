const router = require("express").Router();
const { getUsers, createUser, getUserById } = require("../controllers/users");

//read users
router.get("/", getUsers);

//get user by id
router.get("/:userId", getUserById);

//create user
router.post("/", createUser);

//export router
module.exports = router;
