import { pool } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function setup() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL
      );
    `);

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    // Insert admin if not exists
    await client.query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (username) DO NOTHING`,
      ["admin", adminPassword, "admin"]
    );

    // Insert user if not exists
    await client.query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (username) DO NOTHING`,
      ["user", userPassword, "user"]
    );

    console.log("Database initialized with 'admin' and 'user' accounts.");
  } catch (err) {
    console.error("Error setting up the database:", err);
  } finally {
    client.release();
    pool.end();
  }
}

setup();
