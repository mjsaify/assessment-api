import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants.js';
import UserModel from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

export const auth = asyncHandler(async (req, _, next) => {
    const token = req.cookies.accessToken;

    // check if cookie is null or token is undefined
    if (!req.cookies || token == undefined) {
        return next(new ApiError(401, "Please login"));
    };

    const decodedToken = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decodedToken.id);
    if (!user) {
        return next(new ApiError(401, "Unauthorized access. User not found"));
    };

    req.user = {
        id: decodedToken.id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
    };
    next();
});


export const authorization = (...alowedRoles) =>{
    return (req, _, next) =>{
        if(!alowedRoles.includes(req.user.role)){
            return next(new ApiError(403, "Access forbidden, Only admins are allowed"));
        };
        next();
    };
};