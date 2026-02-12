import express from "express";
import {FileController , AuthController} from "./controller";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(cookieParser());

app.use("/", new AuthController().router)
app.use("/file", new FileController().router);

app.listen(Bun.env.APP_PORT, () => {
    console.log("Server started on port: " + Bun.env.APP_PORT);
})
