const router = require("express").Router();
const { getCurrentUser, updateCurrentUser } = require("../controllers/users");
const auth = require("../middlewares/auth");
const { validateUserUpdateBody } = require("../middlewares/validation");

// get users _id: protected
router.get("/me", auth, getCurrentUser);

// patch users: protected
router.patch("/me", validateUserUpdateBody, auth, updateCurrentUser);

// export router
module.exports = router;
