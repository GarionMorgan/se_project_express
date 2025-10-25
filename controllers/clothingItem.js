const asyncHandler = require("../utils/asyncHandler");
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
const createClothingItem = asyncHandler(async (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    const err = new Error("User not authenticated");
    err.statusCode = BAD_REQUEST;
    throw err;
  }

  const newClothingItem = await ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id,
  });

  res.status(CREATED).send(newClothingItem);
});

// Get all clothing items
const getClothingItems = asyncHandler(async (req, res) => {
  const items = await ClothingItem.find({});
  res.status(OK).send(items);
});

// Delete clothing item
const deleteClothingItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const currentUserId = req.user?._id;

  if (!currentUserId) {
    const err = new Error("User not authenticated");
    err.statusCode = BAD_REQUEST;
    throw err;
  }

  const item = await ClothingItem.findById(itemId).orFail(() => {
    const err = new Error("Clothing item not found");
    err.statusCode = NOT_FOUND;
    throw err;
  });

  // ownership check
  if (item.owner.toString() !== currentUserId.toString()) {
    const err = new Error("Access denied");
    err.statusCode = FORBIDDEN;
    throw err;
  }

  await item.deleteOne();
  res.status(OK).send({ message: "Clothing item deleted" });
});

// Like clothing item
const likeClothingItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    const err = new Error("User not authenticated");
    err.statusCode = BAD_REQUEST;
    throw err;
  }

  const updatedItem = await ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true }
  ).orFail(() => {
    const error = new Error("Clothing item not found");
    error.statusCode = NOT_FOUND;
    throw error;
  });

  res.status(OK).send(updatedItem);
});

// Dislike clothing item
const dislikeClothingItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    const err = new Error("User not authenticated");
    err.statusCode = BAD_REQUEST;
    throw err;
  }

  const updatedItem = await ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true }
  ).orFail(() => {
    const error = new Error("Clothing item not found");
    error.statusCode = NOT_FOUND;
    throw error;
  });

  res.status(OK).send(updatedItem);
});

module.exports = {
  createClothingItem,
  getClothingItems,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
