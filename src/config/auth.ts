import {z} from "zod"
import dotenv from "dotenv"
import path from "path"


dotenv.config({
    path: path.join(__dirname, '../../.env')
});
const configSchema = z.object({
    PORT: z.coerce.number().default(3000),
    connString: z.string(),
    env: z.string(),
})

if (
    process.env.NODE_ENV &&
    !["production", "development", "test"].includes(process.env.NODE_ENV)
) {
    throw new Error(
      "Invalid NODE_ENV value. Allowed values are 'production', 'development', or 'test'.",
    );
  }
  
  const config = configSchema.parse(process.env);
  
  export { config };

export default config