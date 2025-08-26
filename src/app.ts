import { db } from "./database.ts";
import { readFileSync } from "node:fs";
import type { RabbitMQPublisherService } from "./rabbitmq.ts";
import express from "express";
import https from "node:https";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

const PORT = process.env?.["PORT"] || 3000;

export const startServer = async (
    queue: RabbitMQPublisherService,
    secure: boolean,
) => {
    const app = express();

    if (secure) {
        const options = {
            key: readFileSync("./certs/key.pem"),
            cert: readFileSync("./certs/cert.pem"),
        };
        https.createServer(options, app).listen(PORT, () => {
            console.log(`HTTPS server is listening on port ${PORT}`);
        });
    } else {
        // Use app.listen() for HTTP, not https.createServer()
        app.listen(PORT, () => {
            console.log(`HTTP server is listening on port ${PORT}`);
        });
    }

    app.get("/", async (_req, res) => {
        res.send("Hello World!");
    });
    
    app.get("/queue", async (_req, res) => {
        res.send(queue.getConnectionInfo());
    });

    app.get("/db", async (_req, res) => {
        res.send(db.getConnectionInfoHTML());
    });
};