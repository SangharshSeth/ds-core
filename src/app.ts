import express from "express";
import http from "node:http";
import dotenv from "dotenv";
import { db } from "./database.js";

dotenv.config({ path: ".env.development" });

const PORT = process.env?.["PORT"] || 3000;

export const startServer = async () => {
    const app = express();
    const server = http.createServer(app);

    app.get("/", async(_req, res) => {
        const data = await db.query('SELECT NOW()');
        res.send(data);
    });

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};
