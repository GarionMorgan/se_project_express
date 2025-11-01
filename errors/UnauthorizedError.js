const { UNAUTHORIZED_ERROR } = require("../utils/errors");

class UnauthorizedError extends Error {
  constructor(message) {
    super(message); // Pass message to parent Error class
    this.statusCode = UNAUTHORIZED_ERROR; // Set specific HTTP status code
  }
}
module.exports = UnauthorizedError;
