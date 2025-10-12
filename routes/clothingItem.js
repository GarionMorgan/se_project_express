const router = require("express").Router();

const {
  createClothingItem,
  getClothingItems,
  updateClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
} = require("../controllers/clothingItem");

router.get("/", getClothingItems);

// Create clothing item
router.post("/", createClothingItem);

// Delete clothing item
router.delete("/:itemId", deleteClothingItem);

// Like/dislike clothing item
router.put("/:itemId/likes", likeClothingItem);
router.delete("/:itemId/likes", dislikeClothingItem);

// export router
module.exports = router;
