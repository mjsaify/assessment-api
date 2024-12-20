import { app } from "./app.js";
import ConnectDB from "./config/db.js";
import { PORT } from "./constants.js";

; (async function () {
    try {
        await ConnectDB();

        // start server
        const server = app.listen(PORT, () => {
            console.log("Server is up and running on port", PORT);
        });

        // unhandled promise rejections
        process.on("unhandledRejection", (err) => {
            console.log("Unhandle Rejection Occured! Shutting down...");
            console.log(err.message);
            server.close(() => {
                process.exit(1);
            });
        });

        // server runtime error
        server.on("error", (err) => {
            console.log("Server encountered an error after starting:", err);
            server.close(() => {
                process.exit(1);
            });
        });

    } catch (error) {
        console.log("Server startup failed due to:", error.message);
        process.exit(1);
    }
})();