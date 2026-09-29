const mongoose = require("mongoose");
const GST = require("../models/GST");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");

const migrateLegacyOwners = async () => {
    const invoices = await Invoice.find(
        {},
        { user: 1, customer: 1, items: 1 }
    ).lean();
    const customerOwners = new Map();
    const productOwners = new Map();

    for (const invoice of invoices) {
        const ownerid = Number(invoice.user?.userid);
        if (!Number.isInteger(ownerid)) continue;

        const customerid = Number(invoice.customer?.customerid);
        if (Number.isInteger(customerid)) {
            const owners = customerOwners.get(customerid) || new Set();
            owners.add(ownerid);
            customerOwners.set(customerid, owners);
        }

        for (const item of invoice.items || []) {
            const productid = Number(item.productid);
            if (!Number.isInteger(productid)) continue;
            const owners = productOwners.get(productid) || new Set();
            owners.add(ownerid);
            productOwners.set(productid, owners);
        }
    }

    for (const [customerid, owners] of customerOwners) {
        if (owners.size === 1) {
            await Customer.updateOne(
                { customerid, ownerid: { $exists: false } },
                { $set: { ownerid: [...owners][0] } }
            );
        }
    }

    for (const [productid, owners] of productOwners) {
        if (owners.size === 1) {
            await Product.updateOne(
                { productid, ownerid: { $exists: false } },
                { $set: { ownerid: [...owners][0] } }
            );
        }
    }
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const indexes = await GST.collection.indexes();
        const uniqueGSTINIndex = indexes.find((index) => (
            index.unique &&
            index.key.gstin === 1 &&
            Object.keys(index.key).length === 1
        ));

        if (uniqueGSTINIndex) {
            await GST.collection.dropIndex(uniqueGSTINIndex.name);
        }

        await GST.collection.createIndex(
            { gstin: 1, gsttype: 1, gstrate: 1 },
            { unique: true }
        );

        await migrateLegacyOwners();

        const customerIndexes = await Customer.collection.indexes();
        for (const index of customerIndexes) {
            if (
                index.unique &&
                Object.keys(index.key).length === 1 &&
                ["email", "phone_no"].includes(Object.keys(index.key)[0])
            ) {
                await Customer.collection.dropIndex(index.name);
            }
        }

        await Customer.collection.createIndex(
            { ownerid: 1, email: 1 },
            { unique: true }
        );
        await Customer.collection.createIndex(
            { ownerid: 1, phone_no: 1 },
            { unique: true }
        );
        console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;