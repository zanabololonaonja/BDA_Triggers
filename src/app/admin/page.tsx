"use client";

import { useState, useEffect } from "react";

interface Audit {
  id: number;
  type_action: string;
  date_modification: string;
  num_compte: number | null;
  nomclient: string | null;
  solde_ancien: number | null;
  solde_nouveau: number | null;
  utilisateur: string | null;
}

export default function AdminPage() {
  const [audit, setAudit] = useState<Audit[]>([]);

  const chargerAudit = async () => {
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      setAudit(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    chargerAudit();
  }, []);

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
      <h1 className="text-2xl font-bold mb-6">Fenêtre Admin - Supervision</h1>

      <table className="table-auto border-collapse border border-gray-400 w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Utilisateur</th>
            <th className="border px-2 py-1">Action</th>
            <th className="border px-2 py-1">Num Compte</th>
            <th className="border px-2 py-1">Nom Client</th>
            <th className="border px-2 py-1">Solde Ancien</th>
            <th className="border px-2 py-1">Solde Nouveau</th>
          </tr>
        </thead>
        <tbody>
          {audit.map((a) => (
            <tr key={a.id} className="even:bg-gray-100">
              <td className="border px-2 py-1">{new Date(a.date_modification).toLocaleString()}</td>
              <td className="border px-2 py-1">{a.utilisateur || "-"}</td>
              <td className="border px-2 py-1">{a.type_action}</td>
              <td className="border px-2 py-1">{a.num_compte || "-"}</td>
              <td className="border px-2 py-1">{a.nomclient || "-"}</td>
              <td className="border px-2 py-1">{a.solde_ancien !== null ? a.solde_ancien.toLocaleString() : "-"}</td>
              <td className="border px-2 py-1">{a.solde_nouveau !== null ? a.solde_nouveau.toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}