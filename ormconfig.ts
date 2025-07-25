import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';
const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USERNAME || "root",   // Default to 'root' if not provided
    password: process.env.DB_PASSWORD,       // Default to empty string if not provided
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: process.env.NODE_ENV === 'development' ? [__dirname + "/src/entity/*.ts"] : [__dirname + "/src/entity/*.js"],
    migrations: process.env.NODE_ENV === 'development' ? [__dirname + "/src/migration/*.ts"] : [__dirname + "/src/migration/*.js"],
    subscribers: ["src/subscriber/**/*.ts"],
});


export default AppDataSource;
