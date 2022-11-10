require("dotenv").config();
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log("uncaught Exception Server shutting down");
  console.log(err);
  process.exit(1);
});

const app = require("./app");

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to Cloud Database"));

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`server started on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("unhandled Rejection Server shutting down gracefully");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit();
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED, Shutting down server gracefully");
  server.close(() => {
    console.log("🧨 process terminated");
  });
});
