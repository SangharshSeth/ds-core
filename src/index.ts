import { startServer } from "./app.ts";
import { db } from "./database.ts";

//self executing async main function
(async () => {
    await db.connect();
    await startServer();
})();