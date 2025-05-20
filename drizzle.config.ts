import {defineConfig} from "drizzle-kit";

import dotenv from 'dotenv'
dotenv.config({path: './config.env'})
export default defineConfig({
    dialect: "postgresql",
    schema: "./src/config/drizzle/index.ts",
    out: "./src/config/drizzle/migrations",
    dbCredentials:{ 
        url: process.env.DATABASE_URL as string,
    },
    verbose: true,
    strict:true

});