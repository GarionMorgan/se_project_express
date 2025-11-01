const { FORBIDDEN } = require("../utils/errors");

class ForbiddenError extends Error {
  constructor(message) {
    super(message); // Pass message to parent Error class
    this.statusCode = FORBIDDEN; // Set specific HTTP status code
  }
}
module.exports = ForbiddenError;
