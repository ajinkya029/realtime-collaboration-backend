const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "name, email, and password are required" });
  if (String(password).length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ message: "A valid email is required" });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: String(name).trim(), email: normalizedEmail, passwordHash });
  res.status(201).json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email } });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email and password are required" });
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password" });
  res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email } });
}

function me(req, res) {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
}
module.exports = { register, login, me };
