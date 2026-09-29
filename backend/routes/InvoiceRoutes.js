const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const { createInvoice, getAllInvoices, getInvoiceById, getInvoicesByCustomer, updateInvoice, deleteInvoice } = require("../controllers/InvoiceController");

router.use(authenticate);
router.post("/create", createInvoice);
router.get("/", getAllInvoices);
router.get("/customer/:customerId", getInvoicesByCustomer);
router.get("/:id", getInvoiceById);
router.put("/update/:id", updateInvoice);
router.delete("/delete/:id", deleteInvoice);

module.exports = router;
