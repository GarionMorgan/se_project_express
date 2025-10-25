const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error(err);

  // Check if error has a status code, otherwise use 500
  const statusCode = err.statusCode || 500;
  const message = err.message || "An error occurred on the server";

  // Send response
  res.status(statusCode).send({ message });
};

module.exports = errorHandler;
