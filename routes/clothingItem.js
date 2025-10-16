const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  createClothingItem,
  getClothingItems,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
} = require("../controllers/clothingItem");

router.get("/", getClothingItems);

// Create clothing item
router.post("/", auth, createClothingItem);

// Delete clothing item
router.delete("/:itemId", auth, deleteClothingItem);

// Like/dislike clothing item
router.put("/:itemId/likes", auth, likeClothingItem);
router.delete("/:itemId/likes", auth, dislikeClothingItem);

// export router
module.exports = router;
