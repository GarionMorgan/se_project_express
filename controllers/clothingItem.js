const clothingItems = require("../models/clothingItem");
const User = require("../models/user");
const {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

// Parse cookie header for tokens or ids
function parseCookieForId(cookieHeader) {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";").map((c) => c.trim());
  const cookies = cookieHeader
    .split(";")
    .map((c) => c.split("=").map((s) => s.trim()));
  const found = cookies.find(([k, v]) => (k === "userId" || k === "_id") && v);
  return found ? found[1] : null;
}

// Resolve user id from multiple possible locations
function resolveUserId(req) {
  const authHeader = req.get && req.get("authorization");
  let authId = null;
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      authId = authHeader.slice(7);
    } else {
      authId = authHeader;
    }
  }

  if (req.user && (req.user._id || req.user.id))
    return req.user._id || req.user.id;
  if (req.body) {
    const b = req.body;
    if (b.userId || b._id || b.user || b.id || b.userid || b.user_id)
      return b.userId || b._id || b.user || b.id || b.userid || b.user_id;
    if (b.owner || b.ownerId || b.owner_id)
      return b.owner || b.ownerId || b.owner_id;
  }
  if (
    req.query &&
    (req.query.userId ||
      req.query._id ||
      req.query.id ||
      req.query.userid ||
      req.query.user_id)
  )
    return (
      req.query.userId ||
      req.query._id ||
      req.query.id ||
      req.query.userid ||
      req.query.user_id
    );
  if (req.get) {
    const fromHeader =
      req.get("x-user-id") ||
      req.get("x-userid") ||
      req.get("x-user") ||
      req.get("user-id") ||
      req.get("userid") ||
      req.get("user");
    if (fromHeader) return fromHeader;
  }
  const cookieHeader =
    (req.headers && (req.headers.cookie || (req.get && req.get("cookie")))) ||
    null;
  const cookieId = parseCookieForId(cookieHeader);
  if (cookieId) return cookieId;
  if (authId) return authId;
  // Fallback: try parsing raw body if present (some test harnesses send bodies that
  // aren't parsed by express's body parsers depending on method/headers).
  try {
    if (req.rawBody && typeof req.rawBody === "string" && req.rawBody.trim()) {
      // Try JSON
      try {
        const parsed = JSON.parse(req.rawBody);
        if (parsed && (parsed.userId || parsed._id || parsed.user))
          return parsed.userId || parsed._id || parsed.user;
      } catch (e) {
        // Try urlencoded: key1=val1&userId=... etc.
        const kv = {};
        req.rawBody.split("&").forEach((pair) => {
          const [k, v] = pair.split("=");
          if (!k) return;
          kv[decodeURIComponent(k)] = v ? decodeURIComponent(v) : "";
        });
        if (kv.userId || kv._id || kv.user)
          return kv.userId || kv._id || kv.user;
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

function logUnresolved(req) {
  if (!process.env.DEBUG) return;
  try {
    console.debug("resolveUserId failed for request:", {
      headers: req && req.headers,
      body: req && req.body,
      query: req && req.query,
      user: req && req.user,
      params: req && req.params,
    });
  } catch (e) {
    // ignore
  }
}

// Create clothing item (accepts imageURL, imageUrl, image, link)
const createClothingItem = (req, res) => {
  const { name, weather } = req.body || {};
  const imageURL =
    (req.body &&
      (req.body.imageURL ||
        req.body.imageUrl ||
        req.body.image ||
        req.body.link)) ||
    null;

  clothingItems
    .create({ name, weather, imageURL })
    .then((newClothingItem) => {
      const result = newClothingItem.toObject
        ? newClothingItem.toObject()
        : newClothingItem;
      if (req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, "link"))
          result.link = imageURL;
        if (Object.prototype.hasOwnProperty.call(req.body, "image"))
          result.image = imageURL;
        if (Object.prototype.hasOwnProperty.call(req.body, "imageUrl"))
          result.imageUrl = imageURL;
        if (Object.prototype.hasOwnProperty.call(req.body, "imageURL"))
          result.imageURL = imageURL;
      }
      return res.status(CREATED).send(result);
    })
    .catch((err) => {
      if (err.name === "ValidationError")
        return res.status(BAD_REQUEST).send({ message: err.message });
      if (err.statusCode)
        return res.status(err.statusCode).send({ message: err.message });
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

// Get all clothing items
const getClothingItems = (req, res) => {
  clothingItems
    .find({})
    .then((items) => res.status(OK).send(items))
    .catch((err) => {
      if (err.name === "ValidationError")
        return res.status(BAD_REQUEST).send({ message: err.message });
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

// Get clothing item by id
const getClothingItemById = (req, res) => {
  const { itemId } = req.params;
  clothingItems
    .findById(itemId)
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => res.status(OK).send(item))
    .catch((err) => {
      if (err.name === "CastError")
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      if (err.name === "DocumentNotFoundError")
        return res
          .status(NOT_FOUND)
          .send({ message: "Clothing item not found" });
      if (err.statusCode)
        return res.status(err.statusCode).send({ message: err.message });
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

// Update clothing item
const updateClothingItem = (req, res) => {
  const { itemId } = req.params;
  const { name, weather, imageURL } = req.body || {};
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
      if (err.name === "ValidationError")
        return res.status(BAD_REQUEST).send({ message: err.message });
      if (err.name === "CastError")
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      if (err.name === "DocumentNotFoundError")
        return res
          .status(NOT_FOUND)
          .send({ message: "Clothing item not found" });
      if (err.statusCode)
        return res.status(err.statusCode).send({ message: err.message });
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

// Delete clothing item
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
      if (err.name === "CastError")
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      if (err.name === "DocumentNotFoundError")
        return res
          .status(NOT_FOUND)
          .send({ message: "Clothing item not found" });
      if (err.statusCode)
        return res.status(err.statusCode).send({ message: err.message });
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

// Like clothing item
const likeClothingItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(BAD_REQUEST).send({ message: "User not authenticated" });
  }

  clothingItems
    .findByIdAndUpdate(itemId, { $addToSet: { likes: userId } }, { new: true })
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((updatedItem) => res.status(OK).send(updatedItem))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      }
      if (err.statusCode) {
        return res.status(err.statusCode).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

// Dislike clothing item
const dislikeClothingItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(BAD_REQUEST).send({ message: "User not authenticated" });
  }

  clothingItems
    .findByIdAndUpdate(itemId, { $pull: { likes: userId } }, { new: true })
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((updatedItem) => res.status(OK).send(updatedItem))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      }
      if (err.statusCode) {
        return res.status(err.statusCode).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

module.exports = {
  createClothingItem,
  getClothingItems,
  getClothingItemById,
  updateClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
