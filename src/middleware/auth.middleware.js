const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Authentication required" });
  let payload;
  try { payload = verifyToken(token); }
  catch (_err) { return res.status(401).json({ message: "Invalid or expired token" }); }
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: "User no longer exists" });
  req.user = user;
  next();
});
module.exports = { requireAuth };
