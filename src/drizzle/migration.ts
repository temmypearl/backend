import {config} from "../config";

import {drizzle} from "drizzle-orm/postgres-js";
import {migrate} from "drizzle-orm/postgres-js/migrator";
import postgres  from "postgres";

const migrationclient = postgres(config.DATABASE_URL as string)
console.log("Database URL:", config.DATABASE_URL);
async function main() {
    const db = drizzle(migrationclient, { migrationsFolder: "./migrations" } as any);

    const result = await db.execute('select 1');

    await migrationclient.end();
}

main()