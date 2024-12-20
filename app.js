import Express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ApiError from './utils/ApiError.js';
import GlobalErrorHandler from './middleware/error.middleware.js';
import router from './routes/index.js';

const app = Express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(cookieParser());
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use("/api", router);
app.all("*", (req, _, next) => {
    return next(new ApiError(404, `Can't find url ${req.url}`));
});
app.use(GlobalErrorHandler);

export { app };