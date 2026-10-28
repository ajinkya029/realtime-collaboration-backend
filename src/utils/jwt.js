const jwt = require("jsonwebtoken");

function signToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function verifyToken(token) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  return jwt.verify(token, process.env.JWT_SECRET);
}
module.exports = { signToken, verifyToken };
