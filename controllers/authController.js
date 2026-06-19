const bcrypt = require("bcryptjs");

const User = require("../models/User");

const generateToken = require("../config/jwt");

// REGISTER
const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        const userExists =
            await User.findOne({
                email,
            });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message:
                    "User already exists",
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        const user =
            await User.create({
                name,
                email,
                password:
                    hashedPassword,
            });

        res.status(201).json({
            success: true,
            token:
                generateToken(
                    user._id
                ),
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

// LOGIN
const loginUser = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        const user =
            await User.findOne({
                email,
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials",
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials",
            });
        }

        res.status(200).json({
            success: true,
            token:
                generateToken(
                    user._id
                ),
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

// GET PROFILE
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const { name, title, company, timeZone } = req.body;

        if (name !== undefined) user.name = name;
        if (title !== undefined) user.title = title;
        if (company !== undefined) user.company = company;
        if (timeZone !== undefined) user.timeZone = timeZone;

        await user.save();

        // Return updated user data (exclude password)
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
};