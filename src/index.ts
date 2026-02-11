import express from "express";
import {FileController , AuthController} from "./controller";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/auth" , new AuthController().router)
app.use("/file", new FileController().router);

app.listen(Bun.env.APP_PORT, () => {
    console.log("Server started on port: " + Bun.env.APP_PORT);
})