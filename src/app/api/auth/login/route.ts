import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "../../../lib/db";
import { login } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Veuillez fournir un nom d'utilisateur et un mot de passe." },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    // Authentifie l'utilisateur via la session
    await login({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json(
      { message: "Connexion réussie", role: user.role },
      { status: 200 }
    );
  } catch (err: any) {
    if (err.code === "42P01") {
      // relation "users" does not exist
      return NextResponse.json(
        { error: "La base de données n'est pas initialisée. Testez /api/auth/init de créer les tables requises." },
        { status: 500 }
      );
    }
    console.error("Erreur login API:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
