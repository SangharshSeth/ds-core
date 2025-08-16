import { Pool } from "pg";

class PostgresDatabase {
    private static instance: PostgresDatabase;
    private pool: Pool | null = null;
    private connected: boolean = false;

    private constructor() {
        this.pool = new Pool({
            user: process.env["POSTGRES_USER"],
            host: "postgres",
            database: process.env["POSTGRES_DB"],
            password: process.env["POSTGRES_PASSWORD"],
            port: 5432, // Default PostgreSQL port
            max: 20, // Maximum number of connections in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection
        });
    }

    static getInstance(): PostgresDatabase {
        if (!PostgresDatabase.instance) {
            PostgresDatabase.instance = new PostgresDatabase();
        }
        return PostgresDatabase.instance;
    }

    async connect(): Promise<void> {
        if (this.connected) {
            console.log("database already connected");
            return;
        }
        try {
            await this.pool?.query("SELECT NOW()");
            this.connected = true;
            console.log("database connected successfully");
        } catch (error) {
            console.error(`database connection failed due to ${error}`);
            throw error;
        }
    }

    async query(queryString: string, params?: any[]) {
        if (!this.connected) {
            throw new Error("database not connected. call connect() first");
        }
        try {
            const result = await this.pool?.query(queryString, params);
            return result?.rows;
        } catch (error) {
            console.error(`query failed due to ${error}`);
            return null;
        }
    }

    getPool(): Pool | null {
        if (!this.connected) {
            throw new Error("Database not connected. Call connect() first.");
        }
        return this.pool;
    }

    async disconnect(): Promise<void> {
        if (this.connected) {
            await this.pool?.end();
            this.connected = false;
            console.log("Database disconnected");
        }
    }
}

export const db = PostgresDatabase.getInstance();