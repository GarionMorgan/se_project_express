const router = require("express").Router();
const { getCurrentUser, updateCurrentUser } = require("../controllers/users");
const auth = require("../middlewares/auth");

// get users _id: protected
router.get("/me", auth, getCurrentUser);

// patch users: protected
router.patch("/me", auth, updateCurrentUser);

// export router
module.exports = router;
