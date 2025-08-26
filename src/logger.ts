export enum LEVEL {
    INFO = "INFO",
    WARNING = "WARNING",
    DEBUG = "DEBUG",
    ERROR = "ERROR",
    LOG = "LOG",
}

export class Logger {
    private static instance: Logger | null = null;
    private constructor() {}
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    log(
        timestamp: string,
        level: LEVEL,
        service: string,
        message: string,
    ): void {
        let emoji = "";
        switch (level) {
            case LEVEL.INFO:
                emoji = "ℹ️";
                break;
            case LEVEL.WARNING:
                emoji = "⚠️";
                break;
            case LEVEL.DEBUG:
                emoji = "🐞";
                break;
            case LEVEL.ERROR:
                emoji = "❌";
                break;
            case LEVEL.LOG:
                emoji = "📝";
                break;
        }
        console.log(`${emoji} [${timestamp}] [${level}] [${service}] ${message}`);
    }
}
