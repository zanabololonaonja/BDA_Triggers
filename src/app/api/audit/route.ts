import { NextResponse } from "next/server";
import { pool } from "../../lib/db"; // Vérifie le chemin

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT *
       FROM audit_compte
       ORDER BY date_modification DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}