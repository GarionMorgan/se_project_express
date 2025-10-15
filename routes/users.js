const router = require("express").Router();
const { getUsers, getCurrentUser } = require("../controllers/users");
const auth = require("../middlewares/auth");

// get user info: protected
router.get("/", auth, getUsers);

// get users _id: protected
router.get("/me", auth, getCurrentUser);

// export router
module.exports = router;
