const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/ProductController");

router.use(authenticate);
router.post("/create", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/update/:id", updateProduct);
router.delete("/delete/:id", deleteProduct);

module.exports = router;