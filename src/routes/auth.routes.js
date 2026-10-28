const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth.middleware");
const controller = require("../controllers/auth.controller");
router.post("/register", asyncHandler(controller.register));
router.post("/login", asyncHandler(controller.login));
router.get("/me", requireAuth, asyncHandler(controller.me));
module.exports = router;
