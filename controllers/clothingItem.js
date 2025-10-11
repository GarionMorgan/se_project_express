const clothingItems = require("../models/clothingItem");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  OK,
  CREATED,
} = require("../utils/errors");

//create clothing item
const createClothingItem = (req, res) => {
  // Accept multiple possible field names from clients (imageURL, imageUrl, image)
  const { name, weather } = req.body;
  const imageURL = req.body.imageURL || req.body.imageUrl || req.body.image;

  clothingItems
    .create({ name, weather, imageURL })
    .then((newClothingItem) => res.status(CREATED).send(newClothingItem))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      } else if (err.statusCode) {
        return res.status(err.statusCode).send({ message: err.message });
      } else {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};

//read clothing items
const getClothingItems = (req, res) => {
  clothingItems
    .find({})
    .then((items) => res.status(OK).send(items))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      } else {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
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
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((updatedItem) => res.status(OK).send(updatedItem))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      } else if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      } else if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Clothing item not found" });
      } else if (err.statusCode) {
        return res.status(err.statusCode).send({ message: err.message });
      } else {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};
//delete clothing item
const deleteClothingItem = (req, res) => {
  const { itemId } = req.params;
  clothingItems
    .findByIdAndDelete(itemId)
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then(() => res.status(OK).send({ message: "Clothing item deleted" }))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      } else if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Clothing item not found" });
      } else if (err.statusCode) {
        return res.status(err.statusCode).send({ message: err.message });
      } else {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};

//liking a clothing item
const likeClothingItem = (req, res) => {
  const { itemId } = req.params;
  if (!req.user || !req.user._id) {
    return res.status(BAD_REQUEST).send({ message: "User not authenticated" });
  }

  const userId = req.user._id;

  clothingItems
    .findByIdAndUpdate(
      itemId,
      { $addToSet: { likes: userId } }, // Add userId to likes array if not already present
      { new: true }
    )
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((updatedItem) => res.status(OK).send(updatedItem))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      } else if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Clothing item not found" });
      } else {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};

//disliking a clothing item
const dislikeClothingItem = (req, res) => {
  const { itemId } = req.params;
  if (!req.user || !req.user._id) {
    return res.status(BAD_REQUEST).send({ message: "User not authenticated" });
  }
  const userId = req.user._id;

  clothingItems
    .findByIdAndUpdate(
      itemId,
      { $pull: { likes: userId } }, // Remove userId from likes array
      { new: true }
    )
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((updatedItem) => res.status(OK).send(updatedItem))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      } else if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Clothing item not found" });
      } else {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};

//export functions
module.exports = {
  createClothingItem,
  getClothingItems,
  updateClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
