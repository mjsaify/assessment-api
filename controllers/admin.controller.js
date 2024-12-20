import UserModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiFeatures from "../utils/ApiFeature.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


export const GetAllUsers = asyncHandler(async (req, res, __) => {
    const allUsers = new ApiFeatures(UserModel.find(), req.query).pagination();
    const users = await allUsers.queryFunc;
    const findAllUsers = await UserModel.find();
    const totalUsers = await UserModel.countDocuments();
    const totalActiveUsers = findAllUsers.filter((user) => user.isActive !== false);
    const totalPages = Math.ceil(totalUsers / 10);

    return res.status(200).json(new ApiResponse(200, {
        totalPages,
        totalUsers,
        currentPage: Number(req.query.page) || 1,
        users,
        activeUsers: totalActiveUsers.length
    }));
});


export const UpdateUserStatus = asyncHandler(async (req, res, next) => {
    const { id, status } = req.body.formData;
    const user = await UserModel.findByIdAndUpdate(id, { isActive: status }, { new: true });
    if (!user) {
        return next(new ApiError(400, "Could Not Update Status"));
    };

    return res.status(200).json(new ApiResponse(200, "", `${user.firstName} status has changed`));
});


export const DeleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
        return next(new ApiError(400, "Could Not Delete User"));
    };

    return res.status(200).json(new ApiResponse(200, "", `${user.firstName} user deleted`));
});