const asyncHandler = require("../utils/asyncHandler");
const ClothingItem = require("../models/clothingItem");
const { OK, CREATED } = require("../utils/errors");
const UnauthorizedError = require("../errors/UnauthorizedError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

// Create clothing item (accepts imageUrl, imageUrl, image, link)
const createClothingItem = asyncHandler(async (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
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
    throw new UnauthorizedError("User not authenticated");
  }

  const item = await ClothingItem.findById(itemId).orFail(() => {
    throw new NotFoundError("Clothing item not found");
  });

  // ownership check
  if (item.owner.toString() !== currentUserId.toString()) {
    throw new ForbiddenError("Access denied");
  }

  await item.deleteOne();
  res.status(OK).send({ message: "Clothing item deleted" });
});

// Like clothing item
const likeClothingItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }

  const updatedItem = await ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true }
  ).orFail(() => {
    throw new NotFoundError("Clothing item not found");
  });

  res.status(OK).send(updatedItem);
});

// Dislike clothing item
const dislikeClothingItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }

  const updatedItem = await ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true }
  ).orFail(() => {
    throw new NotFoundError("Clothing item not found");
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
