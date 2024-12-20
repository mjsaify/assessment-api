import { z } from 'zod';
import crypto from 'crypto';
import UserModel from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { UserLoginZodSchema, UserSignupZodSchema } from "../utils/_types.js";
import { CookieOptions } from "../constants.js";
import { SendEmail } from '../utils/SendEmail.js';
import { uploadOnCloudinary } from '../utils/file-upload.js';



export const UserSignup = asyncHandler(async (req, res, next) => {
    const { firstName, middleName, email, password, phone, address1 } = req.body.formData;

    // empty fields
    if ([firstName, middleName, email, password, phone, address1].some(field => field.trim() === "")) {
        return next(new ApiError(400, "Fill out required fields"));
    };


    // input validation
    const parsedInputs = UserSignupZodSchema.safeParse(req.body.formData);
    if (!parsedInputs.success) {
        return next(new ApiError(400, "Invalid Fields"));
    };

    // check if user already exist in db
    const user = await UserModel.findOne({ email });
    if (user) {
        return next(new ApiError(400, "User Already Exist"));
    };

    await UserModel.create(parsedInputs.data);
    await SendEmail({
        to: user.email,
        subject: "UMS Application",
        text: "Your account has been created successfully",
    });

    return res.status(201).json(new ApiResponse(201, "", "Account Created Successfull"));
});

export const UserLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // empty fields
    if ([email, password].some((field) => field.trim() === "")) {
        return next(new ApiError(400, "All fields are required"));
    };

    // input validation
    const parsedInputs = UserLoginZodSchema.safeParse(req.body);

    if (!parsedInputs.success) {
        return next(new ApiError(400, "Invalid Fields"));
    };

    const user = await UserModel.findOne({ email: parsedInputs.data.email }).select("+password");
    if (!user) {
        return next(new ApiError(400, "Invalid Credentials"));
    };

    if (user.isActive === false) {
        return next(new ApiError(400, "Your Account is Deactivated. Please contact the support team"));
    };

    const isPasswordCorrect = await user.verifyPassword(parsedInputs.data.password);
    if (!isPasswordCorrect) {
        return next(new ApiError(400, "Invalid Credentials"));
    };

    const token = user.generateToken();
    return res
        .status(200)
        .cookie("accessToken", token, CookieOptions)
        .json(new ApiResponse(200, { user, token }, "Login Successfull"));

});


export const UserLogout = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return next(new ApiError(404, "Something went wrong!, user not found"));
    };

    return res
        .status(200)
        .clearCookie("accessToken", CookieOptions)
        .json(new ApiResponse(200, "", "Logout Successfull"));
});


export const ForgotPasswordRequest = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const schema = z.string().email();
    const parsedInputs = schema.safeParse(email);
    if (!email) next(new ApiError(400, "Email is required"));
    if (!parsedInputs.success) next(new ApiError(400, "Invalid Email"));

    const user = await UserModel.findOne({ email: parsedInputs.data });
    if (!user) next(new ApiError(404, "User Not Found"));

    const resetPasswordToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // send email
    try {
        await SendEmail({
            to: user.email,
            subject: "Password Reset Email",
            text: `Your password reset url <a href="${process.env.CLIENT_URL}/reset-password?token=${resetPasswordToken}" target="_blank">Click to reset your password</a>`,
        });

        return res.status(200).json(new ApiResponse(200, "Reset password email has been sent"));
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ApiError(400, "Email cannot be sent. Please try again later"));
    };

});


export const ResetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.query;
    const { newPassword, confirmPassword } = req.body;
    if (token == undefined || token.length <= 0) {
        return next(new ApiError(400, "Invalid URL"));
    };

    if ([newPassword, confirmPassword].some((field) => field?.trim() === "")) {
        return next(new ApiError(400, "Fields cannot be empty"));
    };

    if (newPassword !== confirmPassword) {
        return next(new ApiError(400, "Passwords do not match"));
    };

    const parsedInputs = UserSignupZodSchema.pick({ password: true }).safeParse({ password: confirmPassword });
    if (!parsedInputs.success) {
        return next(new ApiError(400, "Invalid Fields"));
    };

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: {
            $gt: Date.now(),
        },
    });

    if (!user) {
        return next(new ApiError(400, "Invalid or link has been expired"));
    };

    user.password = parsedInputs.data.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, "Password Reset Successfull"));
});


export const ChangePassword = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if ([oldPassword, newPassword, confirmPassword].some((field) => field?.trim() === "")) {
        return next(new ApiError(400, "All fields are required"));
    };

    if (newPassword !== confirmPassword) {
        return next(new ApiError(400, "New Password does not match with Confirm Password"));
    };

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) next(new ApiError(404, "User Not Found"));

    const isPasswordCorrect = await user.verifyPassword(oldPassword);
    if (!isPasswordCorrect) {
        return next(new ApiError(400, "Old Password is Incorrect"));
    };

    user.password = confirmPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});

export const GetUserDetails = asyncHandler(async (req, res, next) => {
    const { id } = req.user;
    const user = await UserModel.findById(id);
    if (!user) {
        return next(new ApiError(404, "User Not Found"));
    };

    // console.log(user)

    return res.status(200).json(new ApiResponse(200, { user }));
});

export const UpdateUserProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.user;
    let {
        firstName,
        middleName,
        lastName,
        email,
        password,
        phone,
        alternatePhone,
        gender,
        dob,
        address1,
        address2,
        profileImage
    } = req.body;
    let uploadImage;

    if (profileImage) {
        uploadImage = await uploadOnCloudinary(profileImage);
        profileImage = uploadImage.secure_url;
    };


    const user = await UserModel.findByIdAndUpdate(
        id,
        {
            firstName,
            middleName,
            lastName,
            email,
            password,
            phone,
            alternatePhone,
            gender,
            dob,
            address1,
            address2,
            profileImage
        },
        { new: true }
    );
    if (!user) {
        return next(new ApiError(400, "Could not update profile"));
    };

    return res.status(200).json(new ApiResponse(200, "", "Profile Updated Successfully"));
});

export const DeleteUserProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.user;
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
        return next(new ApiError(400, "Could not delete profile"));
    };

    return res
        .status(200)
        .clearCookie("accessToken", CookieOptions)
        .json(new ApiResponse(200, "", "Profile Deleted Successfully"));
});