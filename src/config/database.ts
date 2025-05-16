import { Sequelize } from "sequelize-typescript";

import dotenv from "dotenv";
import { config } from  "./auth";
// import { User } from "../modules/users/user.model";
import { User } from "../modules/users/user.model"
dotenv.config(); 

export const sequelize = new Sequelize(
  config.connString,
{
    host: process.env.DB_HOST, 
    dialect: "postgres",
    logging: false, 
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
}
);

// Register models
sequelize.addModels([User]);

// Test database connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};
