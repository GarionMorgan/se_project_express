const { CONFLICT } = require("../utils/errors");

class ConflictError extends Error {
  constructor(message) {
    super(message); // Pass message to parent Error class
    this.statusCode = CONFLICT; // Set specific HTTP status code
  }
}
module.exports = ConflictError;
