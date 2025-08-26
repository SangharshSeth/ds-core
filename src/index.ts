import { startServer } from "./app.ts";
import { db } from "./database.ts";
import { LEVEL, Logger } from "./logger.ts";
import { RabbitMQPublisherService } from "./rabbitmq.ts";

//self executing async main function
(async () => {
    const logger = Logger.getInstance();
    const rabbitmqURL = `amqp://${process.env?.["RABBITMQ_DEFAULT_USER"]}:${
        process.env?.["RABBITMQ_DEFAULT_PASS"]
    }@${process.env?.["RABBITMQ_HOST"]}:${process.env?.["RABBITMQ_PORT"]}`;
    console.log(`RabbitMQ URL ${rabbitmqURL}`);
    const queue = RabbitMQPublisherService.getInstance(rabbitmqURL, logger);
    await db.connect();
    await queue.connect();
    await startServer(queue,false);
    process.on("uncaughtException", (err) => {
        logger.log(
            new Date().toISOString(),
            LEVEL.ERROR,
            "Index",
            `Uncaught Exception: ${err.message}`,
        );
        process.exit(1);
    });
    process.on("unhandledRejection", (reason, promise) => {
        logger.log(
            new Date().toISOString(),
            LEVEL.ERROR,
            "Index",
            `Unhandled Rejection at: ${promise}, reason: ${reason}`,
        );
        process.exit(1);
    });
})();
