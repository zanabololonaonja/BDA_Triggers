import { NextResponse } from "next/server";
import { pool } from "../../lib/db"; // Vérifie bien le chemin
import { getSession } from "../../../lib/auth";

// AJOUTER
export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const session = await getSession();
    const username = session?.user?.username || "inconnu";
    const body = await req.json();

    await client.query("BEGIN");
    // On définit le pseudo de l'utilisateur pour le trigger audit
    await client.query("SELECT set_config('app.current_user', $1, true)", [username]);
    
    await client.query(
      "INSERT INTO compte(nomclient, solde) VALUES($1, $2)",
      [body.nomclient, body.solde]
    );

    await client.query("COMMIT");
    return NextResponse.json({ message: "Compte ajouté avec succès" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    client.release();
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
  const client = await pool.connect();
  try {
    const session = await getSession();
    const username = session?.user?.username || "inconnu";
    const body = await req.json();

    await client.query("BEGIN");
    await client.query("SELECT set_config('app.current_user', $1, true)", [username]);

    await client.query(
      "UPDATE compte SET nomclient=$1, solde=$2 WHERE num_compte=$3",
      [body.nomclient, body.solde, body.num_compte]
    );

    await client.query("COMMIT");
    return NextResponse.json({ message: "Compte modifié avec succès" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    client.release();
  }
}

// SUPPRIMER UN COMPTE
export async function DELETE(req: Request) {
  const client = await pool.connect();
  try {
    const session = await getSession();
    const username = session?.user?.username || "inconnu";
    const body = await req.json();

    await client.query("BEGIN");
    await client.query("SELECT set_config('app.current_user', $1, true)", [username]);

    await client.query("DELETE FROM compte WHERE num_compte=$1", [body.num_compte]);

    await client.query("COMMIT");
    return NextResponse.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    client.release();
  }
}