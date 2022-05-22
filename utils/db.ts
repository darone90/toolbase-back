import { createPool } from "mysql2/promise";
import { appConfig } from "../config.data";

export const pool = createPool({
    host: appConfig.database.host,
    user: appConfig.database.user,
    database: appConfig.database.database,
    namedPlaceholders: true,
    decimalNumbers: true,
});