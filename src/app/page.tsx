"use client";

import { useState, useEffect } from "react";

interface Compte {
  num_compte: number;
  nomclient: string;
  solde: number;
}

export default function UserPage() {
  const [nomclient, setNomclient] = useState<string>("");
  const [solde, setSolde] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Charger tous les comptes
  const chargerComptes = async () => {
    try {
      const res = await fetch("/api/comptes");
      const data = await res.json();
      setComptes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    chargerComptes();
  }, []);

  const sauvegarderCompte = async () => {
    if (!nomclient || !solde) {
      setMessage("Veuillez remplir tous les champs !");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { num_compte: editingId, nomclient, solde: parseFloat(solde) }
        : { nomclient, solde: parseFloat(solde) };

      const res = await fetch("/api/comptes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(editingId ? "Compte modifié !" : "Compte ajouté !");
        setNomclient("");
        setSolde("");
        setEditingId(null);
        chargerComptes();
      } else {
        setMessage(data.error || "Erreur serveur");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur");
    }
  };

  const modifierCompte = (c: Compte) => {
    setNomclient(c.nomclient);
    setSolde(c.solde.toString());
    setEditingId(c.num_compte);
  };

  const supprimerCompte = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce compte ?")) return;
    try {
      const res = await fetch("/api/comptes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num_compte: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Compte supprimé !");
        chargerComptes();
      } else {
        setMessage(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur");
    }
  };

  return (
    <div className="p-10">
      {/* 🔹 Barre de navigation fixe en haut */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 text-white flex justify-start gap-4 px-6 py-3 shadow-md z-50">
        <a href="/" className="hover:underline">
          Utilisateur
        </a>
        <a href="/admin" className="hover:underline">
          Admin / Audit
        </a>
      </nav>

      {/* Ajouter un padding top pour que le contenu ne soit pas caché par la nav */}
      <div className="pt-16">
        <h1 className="text-2xl font-bold mb-6">
          Fenêtre Utilisateur - Gestion des Comptes
        </h1>

        <div className="space-y-4 max-w-md mb-10">
          <input
            type="text"
            placeholder="Nom du client"
            value={nomclient}
            onChange={(e) => setNomclient(e.target.value)}
            className="border p-2 w-full"
          />

          <input
            type="number"
            placeholder="Solde"
            value={solde}
            onChange={(e) => setSolde(e.target.value)}
            className="border p-2 w-full"
          />

          <button
            onClick={sauvegarderCompte}
            className="bg-blue-600 text-white px-4 py-2"
          >
            {editingId ? "Modifier" : "Ajouter"}
          </button>

          {message && <p className="mt-4 text-red-600">{message}</p>}
        </div>

        <h2 className="text-xl font-semibold mb-4">Liste des comptes</h2>
        <ul className="space-y-2 max-w-md">
          {comptes.map((c) => (
            <li
              key={c.num_compte}
              className="border p-2 flex justify-between items-center"
            >
              <span>
                {c.nomclient} - {c.solde.toLocaleString()} Ar
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => modifierCompte(c)}
                  className="bg-yellow-500 text-white px-2 py-1"
                >
                  Modifier
                </button>
                <button
                  onClick={() => supprimerCompte(c.num_compte)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}