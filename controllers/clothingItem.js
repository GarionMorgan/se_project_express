const clothingItems = require("../models/clothingItem");
//create clothing item
const createClothingItem = (req, res) => {
  const { name, weather, imageURL } = req.body;
  clothingItems
    .create({ name, weather, imageURL })
    .orFail()
    .then((newClothingItem) => res.status(201).send(newClothingItem))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: err.message });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

//read clothing items
const getClothingItems = (req, res) => {
  clothingItems
    .find({})
    .orFail()
    .then((items) => res.status(200).send(items))
    .catch((err) => res.status(500).send({ message: err.message }));
};

//update clothing item
const updateClothingItem = (req, res) => {
  const { itemId } = req.params;
  const { name, weather, imageURL } = req.body;
  clothingItems
    .findByIdAndUpdate(
      itemId,
      { name, weather, imageURL },
      { new: true, runValidators: true }
    )
    .orFail()
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(404).send({ message: "Clothing item not found" });
      }
      return res.status(200).send(updatedItem);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: err.message });
      } else if (err.name === "CastError") {
        res.status(400).send({ message: "Invalid item ID" });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};
//delete clothing item
const deleteClothingItem = (req, res) => {
  const { itemId } = req.params;
  clothingItems
    .findByIdAndDelete(itemId)
    .orFail()
    .then((deletedItem) => {
      if (!deletedItem) {
        return res.status(404).send({ message: "Clothing item not found" });
      }
      return res.status(200).send({ message: "Clothing item deleted" });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({ message: "Invalid item ID" });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

//export functions
module.exports = {
  createClothingItem,
  getClothingItems,
  updateClothingItem,
  deleteClothingItem,
};
