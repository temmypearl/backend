import { url } from 'inspector';
import { config } from './src/config';

export default {
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
//   driver: "pg",
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL ,
  },
  verbose: true,
} as const;