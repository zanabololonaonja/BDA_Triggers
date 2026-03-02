import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "BDA_TRIGGERS",
  password: "onja",
  port: 5432,
});