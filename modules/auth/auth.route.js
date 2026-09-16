const express = require("express");
const router = express.Router();
const rateLimiter = require("../../middleware/rateLimiter");

// Controllers
const authController = require("./auth.controller");

// Middlewares
const protect = require("../../middleware/authMiddleware");

router.post("/login", rateLimiter, authController.login);
router.get("/refresh", rateLimiter, authController.refresh);
router.post("/logout", rateLimiter, authController.logout);
router.patch("/changePassword", rateLimiter, protect, authController.changePassword);

module.exports = router;
