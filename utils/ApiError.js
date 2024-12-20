class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.status = this.statusCode >= 400 && this.statusCode < 500 ? "Failed" : "Error";
        this.success = false;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    };
};
export default ApiError;