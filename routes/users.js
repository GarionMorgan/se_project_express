const router = require("express").Router();
const { getUsers, getUserById } = require("../controllers/users");
const auth = require("../middlewares/auth");

// get user info: protected
router.get("/", auth, getUsers);

// get users _id: protected
router.get("/:id", auth.getUserById);

// export router
module.exports = router;
