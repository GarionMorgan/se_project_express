const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  validateCardBody,
  validateItemId,
} = require("../middlewares/validation");

const {
  createClothingItem,
  getClothingItems,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
} = require("../controllers/clothingItem");

router.get("/", getClothingItems);

// Create clothing item
router.post("/", validateCardBody, auth, createClothingItem);

// Delete clothing item
router.delete("/:itemId", validateItemId, auth, deleteClothingItem);

// Like/dislike clothing item
router.put("/:itemId/likes", validateItemId, auth, likeClothingItem);
router.delete("/:itemId/likes", validateItemId, auth, dislikeClothingItem);

// export router
module.exports = router;
