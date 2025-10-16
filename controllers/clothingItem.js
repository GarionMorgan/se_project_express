const ClothingItem = require("../models/clothingItem");
const {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
} = require("../utils/errors");

// Create clothing item (accepts imageUrl, imageUrl, image, link)
const createClothingItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((newClothingItem) => {
      res.status(CREATED).send(newClothingItem);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

// Get all clothing items
const getClothingItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(OK).send(items))
    .catch((err) => {
      if (err.name === "ValidationError")
        return res.status(BAD_REQUEST).send({ message: "Invalid data" });
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

// Delete clothing item
const deleteClothingItem = async (req, res) => {
  const { itemId } = req.params;
  const currentUserId = req.user._id;

  try {
    const item = await ClothingItem.findById(itemId);

    if (!item) {
      return res.status(NOT_FOUND).send({ message: "Clothing item not found" });
    }

    // ownership check
    if (item.owner.toString() !== currentUserId.toString()) {
      return res.status(FORBIDDEN).send({ message: "Access denied" });
    }

    await item.deleteOne();
    return res.status(OK).send({ message: "Clothing item deleted" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
    }

    if (err.name === "DocumentNotFoundError") {
      return res.status(NOT_FOUND).send({ message: "Clothing item not found" });
    }

    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .send({ message: "An error has occurred" });
    }

    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
};

// Like clothing item
const likeClothingItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  if (!userId) {
    const err = new Error("User not authenticated");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((updatedItem) => {
      res.status(OK).send(updatedItem);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

// Dislike clothing item
const dislikeClothingItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  if (!userId) {
    const err = new Error("User not authenticated");
    err.statusCode = BAD_REQUEST;
    return next(err);
  }

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((updatedItem) => {
      res.status(OK).send(updatedItem);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = {
  createClothingItem,
  getClothingItems,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
