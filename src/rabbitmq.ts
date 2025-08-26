import * as amqplib from "amqplib";
import { LEVEL, type Logger } from "./logger.ts";

//Key points
//publishers make exchanges, consumers bind queues to exchanges
//exchanges route messages to queues based on routing keys
//But sometimes publishers can also make queues like dead-letter queues

//RabbitMQ can be configured with an alternate exchange for cases of unroutable messages. If messages can't be routed in the primary exchange
// they are forwarded to the alternate exchange, where you must bind at least one queue to capture these messages.
//  This setup ensures messages don't get lost even if no matching queue exists on the main exchange.

//A fanout exchange ignores routing keys and just delivers a copy to every bound queue.
//That makes it “safe”

//Any unroutable message will always be caught, regardless of routing key.

//You don’t have to worry about setting up matching keys on the AE.

export class RabbitMQPublisherService {
    private static instance: RabbitMQPublisherService | null = null;
    private connection: amqplib.ChannelModel | null = null;
    private channel: amqplib.Channel | null = null;
    private readonly connectionString: string;
    private isInitialized: boolean = false;
    private logger: Logger;

    constructor(connectionString: string, logger: Logger) {
        if (!connectionString) {
            throw new Error("missing rabbitmq connection string :(");
        }
        this.connectionString = connectionString;
        this.logger = logger;
    }

    public static getInstance(
        connectionString: string,
        logger: Logger,
    ): RabbitMQPublisherService {
        if (!RabbitMQPublisherService.instance) {
            RabbitMQPublisherService.instance = new RabbitMQPublisherService(
                connectionString,
                logger,
            );
        }
        return RabbitMQPublisherService.instance;
    }

    public async connect(): Promise<void> {
        if (this.connection && this.isInitialized && this.channel) {
            this.logger.log(
                Date.now().toLocaleString(),
                LEVEL.LOG,
                "RabbitMQService",
                "rabbitmq is already connected.",
            );
            return;
        }
        try {
            this.connection = await amqplib.connect(this.connectionString);
            this.channel = await this.connection.createChannel();
            this.isInitialized = true;
            this.logger.log(
                Date.now().toLocaleString(),
                LEVEL.LOG,
                "RabbitMQService",
                "rabbitmq is connected successfully",
            );
            return;
        } catch (error) {
            this.isInitialized = false;
            console.log("failed to initialize amqp connection", error);
            return;
        }
    }

    public getConnectionInfo(): Record<string, string | boolean> {
        const info = {
            isInitialized: this.isInitialized,
            hasConnection: this.connection !== null,
            hasChannel: this.channel !== null,
            connectionString: this.connectionString.replace(
                /:[^:@]*@/,
                ":***@",
            ), // Hide password
            instanceCreated: RabbitMQPublisherService.instance !== null,
        };
        return info;
    }
}
