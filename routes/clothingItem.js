const router = require("express").Router();
const {
  createClothingItem,
  getClothingItems,
  updateClothingItem,
  deleteClothingItem,
} = require("../controllers/clothingItem");

router.get("/", getClothingItems);

//create clothing item
router.post("/", createClothingItem);

//read clothing items
router.get("/", getClothingItems);

//update clothing item
router.put("/:itemId", updateClothingItem);

//delete clothing item
router.delete("/:itemId", deleteClothingItem);

//export router
module.exports = router;
