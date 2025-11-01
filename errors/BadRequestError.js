const { BAD_REQUEST } = require("../utils/errors");

class BadRequestError extends Error {
  constructor(message) {
    super(message); // Pass message to parent Error class
    this.statusCode = BAD_REQUEST; // Set specific HTTP status code
  }
}
module.exports = BadRequestError;
