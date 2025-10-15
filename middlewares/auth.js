const jwt = require("jsonwebtoken");
const { UNAUTHORIZED_ERROR } = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(UNAUTHORIZED_ERROR)
      .send({ message: "Authorization required" });
  }

  const token = authorization.replace("Bearer ", "");

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res
      .status(UNAUTHORIZED_ERROR)
      .send({ message: "Invalid or expired token" });
  }

  // attach user info to request
  req.user = payload;

  // pass control to next middleware/route
  next();
};
