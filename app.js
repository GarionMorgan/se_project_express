const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");
const routes = require("./routes");

const app = express();

const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(console.error);

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
app.use("/", mainRouter);
app.use(routes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Global error handler to ensure JSON error responses
app.use((err, req, res, next) => {
  req.user = { _id: "64a7f3f4f1c2b8b5d6e8c9a0" }; // Example user ID

  // If response already sent, delegate to default handler
  if (res.headersSent) {
    return next(err);
  }
  const status = err.statusCode || err.status || 500;
  return res
    .status(status)
    .json({ message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
