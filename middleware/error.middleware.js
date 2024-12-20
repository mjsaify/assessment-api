import { NODE_ENV } from "../constants.js";


const DevError = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error
    });
};

const ProdError = (error, res) => {
    if (error.isOperational) {
        res.status(500).json({
            status: error.status,
            message: error.message,
        });
    } else {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    };
};


export default (error, _, res, __) => {
    error.status = error.status || "error";
    error.statusCode = error.statusCode || 500;

    if (NODE_ENV === "development") {
        DevError(error, res);
    } else if (NODE_ENV === "production") {
        ProdError(error, res);
    } else {
        return null;
    };
};