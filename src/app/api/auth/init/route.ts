import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "../../../lib/db";

export async function GET() {
  const client = await pool.connect();
  try {
    // 1. Créer la table si elle n'existe pas
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL
      );
    `);

    // 2. Hasher les mots de passe
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    // 3. Insérer admin
    await client.query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (username) DO NOTHING`,
      ["admin", adminPassword, "admin"]
    );

    // 4. Insérer user
    await client.query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (username) DO NOTHING`,
      ["user", userPassword, "user"]
    );

    return NextResponse.json({ message: "Base de données initialisée avec les comptes 'admin' (admin123) et 'user' (user123)." }, { status: 200 });
  } catch (err: any) {
    console.error("Erreur lors de l'initialisation de la DB :", err);
    return NextResponse.json({ error: "Erreur serveur : \n" + err?.message }, { status: 500 });
  } finally {
    client.release();
  }
}
