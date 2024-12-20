import mongoose from "mongoose";
import crypto from 'crypto';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRY, JWT_SECRET } from "../constants.js";

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        middleName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            select: false,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        alternatePhone: {
            type: String,
        },
        gender: {
            type: String,
            required: true,
        },
        joinAt: {
            type: Date,
            default: Date.now(),
        },
        dob: {
            type: Date,
            required: true,
        },
        address1: {
            type: String,
            required: true,
        },
        address2: {
            type: String,
        },
        profileImage: {
            type: String,
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true
        },
        role: {
            type: String,
            default: "user"
        },
        resetPasswordToken: String,
        resetPasswordExpiry: Date
    },
    {
        timestamps: true,
    }
);

// hash password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) next();
    this.password = await argon2.hash(this.password);
});

// verify password
UserSchema.methods.verifyPassword = async function (password) {
    return await argon2.verify(this.password, password);
};

// generate jwt
UserSchema.methods.generateToken = function () {
    const payload = {
        id: this._id,
        email: this.email,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

// password reset token
UserSchema.methods.generateResetPasswordToken = function () {
    const token = crypto.randomBytes(64).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 15 minutes
    return token;
};

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;