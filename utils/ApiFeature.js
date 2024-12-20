import ApiError from "./ApiError.js";

class ApiFeatures {
    constructor(queryFunc, queryStr) {
        this.queryFunc = queryFunc;
        this.queryStr = queryStr;
    };

    pagination() {
        const page = Number(this.queryStr.page) || 1;
        const limit = 10;
        const skip = limit * (page - 1);
        this.queryFunc = this.queryFunc.skip(skip).limit(limit);

        // handle page exceeding error
        if (skip >= this.totalProducts) {
            throw new ApiError(404, "Page Not Found");
        };
        return this;
    }
};
export default ApiFeatures;