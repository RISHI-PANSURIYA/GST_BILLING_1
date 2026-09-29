const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } = require("../controllers/PaymentController");

router.use(authenticate);
router.post("/create", createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.put("/update/:id", updatePayment);
router.delete("/delete/:id", deletePayment);

module.exports = router;