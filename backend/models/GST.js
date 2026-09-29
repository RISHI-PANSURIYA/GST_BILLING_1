const mongoose = require("mongoose");

const gstSchema = new mongoose.Schema(
    {
        gstid: {
            type: Number,
            required: [true, "GST ID is required"],
            unique: true,
            min: [1, "GST ID must be greater than 0"],
            validate: {
                validator: Number.isInteger,
                message: "GST ID must be an integer"
            }
        },

        gstrate: {
            type: Number,
            required: [true, "GST rate is required"],
            min: [0, "GST rate cannot be negative"],
            max: [100, "GST rate cannot exceed 100"]
        },

        gsttype: {
            type: String,
            required: [true, "GST type is required"],
            enum: {
                values: ["CGST", "SGST", "IGST", "CGST+SGST"],
                message: "GST type must be CGST, SGST, IGST or CGST+SGST"
            },
            trim: true
        },

        gstin: {
            type: String,
            required: [true, "GSTIN is required"],
            trim: true,
            uppercase: true,
            minlength: [15, "GSTIN must be exactly 15 characters"],
            maxlength: [15, "GSTIN must be exactly 15 characters"],
            match: [
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
                "Please enter a valid GSTIN"
            ]
        }
    },
    {
        collection: "GST",
        timestamps: true
    }
);

gstSchema.index(
    { gstin: 1, gsttype: 1, gstrate: 1 },
    { unique: true }
);

const GST = mongoose.model("GST", gstSchema);

module.exports = GST;