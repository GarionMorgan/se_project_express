const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRouter = require("./routes/index");
const errorHandler = require("./middlewares/error-handler");
const { errors } = require("celebrate");
const { requestLogger, errorLogger } = require("./middlewares/logger");
require("dotenv").config();

const app = express();

const dbUrl = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/wtwr_db";

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ["https://knowtwrtoday.jumpingcrab.com", "https://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  // allowedHeaders: ["Content-Type", "Authorization"],
};

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(console.error);

// applying cors to routes
app.use(cors(corsOptions));

// body parsers with raw buffer capture
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

app.use(requestLogger);

// routes

app.use("/", mainRouter);

// centralized error logging
app.use(errorLogger);

// catching celebrate validation errors
app.use(errors());

// Global error handler to ensure JSON error responses (must be last)

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
