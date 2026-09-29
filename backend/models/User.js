const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        userid: {
            type: Number,
            required: [true, "User ID is required"],
            unique: true,
            min: [1, "User ID must be greater than 0"],
            validate: {
                validator: Number.isInteger,
                message: "User ID must be an integer"
            }
        },

        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        businessName: {
            type: String,
            trim: true,
            minlength: [2, "Business name must be at least 2 characters"],
            maxlength: [150, "Business name cannot exceed 150 characters"]
        },

        gstin: {
            type: String,
            trim: true,
            uppercase: true,
            minlength: [15, "GSTIN must be exactly 15 characters"],
            maxlength: [15, "GSTIN must be exactly 15 characters"],
            match: [
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
                "Please enter a valid GSTIN"
            ]
        },

        address: {
            type: String,
            trim: true,
            minlength: [5, "Business address must be at least 5 characters"],
            maxlength: [300, "Business address cannot exceed 300 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address"
            ]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            maxlength: [100, "Password cannot exceed 100 characters"],
            select: false
        },

        phone_no: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: [
                /^[6-9]\d{9}$/,
                "Phone number must be a valid 10-digit Indian mobile number"
            ]
        },

        role: {
            type: String,
            enum: {
                values: ["Admin", "User"],
                message: "Role must be Admin or User"
            },
            default: "User"
        },

        tokenVersion: {
            type: Number,
            default: 0
        }
    },
    {
        collection: "User",
        timestamps: true,
        toJSON: {
            transform(_document, value) {
                delete value.password;
                return value;
            }
        }
    }
);

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;