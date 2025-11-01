const { NOT_FOUND } = require("../utils/errors");

class NotFoundError extends Error {
  constructor(message) {
    super(message); // Pass message to parent Error class
    this.statusCode = NOT_FOUND; // Set specific HTTP status code
  }
}
module.exports = NotFoundError;
