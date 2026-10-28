const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((v) => v.trim())
    : true,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "collaboration-backend" }));
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;
