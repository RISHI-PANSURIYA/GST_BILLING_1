const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } = require("../controllers/CustomerController");

router.use(authenticate);
router.post("/create", createCustomer);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/update/:id", updateCustomer);
router.delete("/delete/:id", deleteCustomer);

module.exports = router;