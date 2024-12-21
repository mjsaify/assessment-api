export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const DB_URL = process.env.PROD_DB_URL + process.env.DB_NAME;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRY = process.env.JWT_EXPIRY;
export const CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;