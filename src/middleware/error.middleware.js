function notFound(req, res, _next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
function errorHandler(err, _req, res, _next) {
  if (err && err.code === 11000) return res.status(409).json({ message: "Email already registered" });
  if (err && err.name === "ValidationError") return res.status(400).json({ message: err.message });
  if (err && err.name === "CastError") return res.status(400).json({ message: "Invalid resource ID" });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? "Internal server error" : err.message });
}
module.exports = { notFound, errorHandler };
