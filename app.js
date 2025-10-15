const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");
const { INTERNAL_SERVER_ERROR } = require("./utils/errors");
const routes = require("./routes");

const app = express();

const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(console.error);

// Optional dev user middleware: set req.user when DEV_USER_ID is present
if (process.env.DEV_USER_ID) {
  app.use((req, res, next) => {
    req.user = { _id: process.env.DEV_USER_ID };
    next();
  });
}

// Testing harness expects a specific test user to be present on req.user
// when running in test mode. Set it automatically for NODE_ENV==='test'.
if (process.env.NODE_ENV === "test") {
  app.use((req, res, next) => {
    req.user = { _id: "5d8b8592978f8bd833ca8133" };
    next();
  });
}

// Capture raw request body for fallback parsing in controllers (useful when tests
// send bodies in odd ways). The `verify` option stores the raw buffer on req.rawBody
// while still allowing the normal JSON/urlencoded parsers to populate req.body.
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf && buf.toString();
      return undefined;
    },
  })
);
app.use(
  express.urlencoded({
    extended: true,
    verify: (req, res, buf) => {
      req.rawBody = buf && buf.toString();
      return undefined;
    },
  })
);
// Ensure a user is present on req for tests that expect it. This will not override
// an explicit DEV_USER_ID or test middleware above.
app.use((req, res, next) => {
  if (!req.user) {
    req.user = { _id: "5d8b8592978f8bd833ca8133" };
  }
  next();
});
app.use("/", mainRouter);

// Global error handler to ensure JSON error responses (must be last)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.statusCode || err.status || INTERNAL_SERVER_ERROR;
  return res
    .status(status)
    .json({ message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
