import mongoose from "mongoose";
import { DB_URL } from "../constants.js";

const ConnectDB = async () => {
    await mongoose.connect(DB_URL);
    console.log("Database Connected");
};

export default ConnectDB;