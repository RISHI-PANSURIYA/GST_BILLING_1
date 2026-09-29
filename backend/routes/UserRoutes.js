const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

const {
	registerUser,
	loginUser,
	logoutUser,
	getCurrentUser,
	createUser,
	getAllUsers,
	getUserById,
	updateUser,
	deleteUser
} = require("../controllers/UserController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.get("/me", authenticate, getCurrentUser);

router.use(authenticate);
router.post("/create", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
module.exports = router;