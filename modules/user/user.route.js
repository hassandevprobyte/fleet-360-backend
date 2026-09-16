const express = require("express");
const router = express.Router();

// Controllers
const userController = require("./user.controller");

router.route("/").get(userController.getUsersWithPagination).post(userController.createUser);
router.route("/all").get(userController.getAllUsers);
router.route("/:id").get(userController.getUserById).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
