const userRepository = require("../repositories/UserRepository");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { timingSafeEqual } = require("node:crypto");

const getJwtSecret = () => process.env.JWT_SECRET;

const issueToken = (user) => jwt.sign(
    {
        sub: String(user.userid),
        version: user.tokenVersion || 0
    },
    getJwtSecret(),
    { expiresIn: "7d" }
);

const registerUser = async (req, res) => {
    if (!getJwtSecret()) {
        return res.status(500).json({ message: "Authentication is not configured. Set JWT_SECRET." });
    }

    if (!req.body.businessName || !req.body.gstin || !req.body.address) {
        return res.status(400).json({ message: "Business name, GSTIN, and business address are required." });
    }

    try {
        const user = await userRepository.createUser(req.body);
        return res.status(201).json({ token: issueToken(user), user });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    if (!getJwtSecret()) {
        return res.status(500).json({ message: "Authentication is not configured. Set JWT_SECRET." });
    }

    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isHashed = /^\$2[aby]\$/.test(user.password);
        const passwordMatches = isHashed
            ? await bcrypt.compare(password, user.password)
            : password.length === user.password.length && timingSafeEqual(
                Buffer.from(password),
                Buffer.from(user.password)
            );

        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (!isHashed) {
            user.password = password;
            await user.save();
        }

        return res.status(200).json({
            token: issueToken(user),
            user: user.toJSON()
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
        await req.user.save();
        return res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getCurrentUser = (req, res) => res.status(200).json({ user: req.user.toJSON() });

const createUser = async (req, res) => {

    try {

        const user = await userRepository.createUser(req.body);

        res.status(201).json(user);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const getAllUsers = async (req, res) => {

    try
    {

        const users = await userRepository.getAllUsers();

        res.status(200).json(users);

    }
    catch (error)
    {

        res.status(500).json({
            message: error.message
        });

    }

};

const getUserById = async (req,res) =>

{

    try
    {

        const user = await userRepository.getUserById(req.params.id);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json(user);

    }
    catch (error)
    {

        res.status(404).json({
            message: error.message
        });

    }

};

const updateUser = async (req, res) => {

    try {

        const user = await userRepository.updateUser(
            req.params.id,
            req.body
        );

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json(user);

    }
    catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const deleteUser = async (req, res) => {

    try {

        const user = await userRepository.deleteUser(req.params.id);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json(user);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

module.exports = {

    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser

};