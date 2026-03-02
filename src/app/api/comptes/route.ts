import { NextResponse } from "next/server";
import { pool } from "../../lib/db"; // Vérifie bien le chemin

// AJOUTER
export async function POST(req: Request) {
  try {
    const body = await req.json();

    await pool.query(
      "INSERT INTO compte(nomclient, solde) VALUES($1, $2)",
      [body.nomclient, body.solde]
    );

    return NextResponse.json({ message: "Compte ajouté avec succès" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// LISTER TOUS LES COMPTES
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM compte ORDER BY num_compte DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// MODIFIER UN COMPTE
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    await pool.query(
      "UPDATE compte SET nomclient=$1, solde=$2 WHERE num_compte=$3",
      [body.nomclient, body.solde, body.num_compte]
    );

    return NextResponse.json({ message: "Compte modifié avec succès" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// SUPPRIMER UN COMPTE
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    await pool.query("DELETE FROM compte WHERE num_compte=$1", [body.num_compte]);

    return NextResponse.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}