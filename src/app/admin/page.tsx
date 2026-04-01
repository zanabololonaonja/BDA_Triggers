"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/src/app/components/Sidebar";

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
    <div className="flex min-h-screen bg-[#fdf2f8]">
      <Sidebar />
      <div className="flex-1 ml-56 p-10 pt-20">
        <h1 className="text-3xl font-bold mb-8 text-pink-900">
          Fenêtre Admin - Supervision Audit
        </h1>

        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-pink-100 w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-pink-100 text-pink-900">
                  <th className="py-4 px-4 font-semibold whitespace-nowrap">Date & Heure</th>
                  <th className="py-4 px-4 font-semibold whitespace-nowrap">Utilisateur</th>
                  <th className="py-4 px-4 font-semibold whitespace-nowrap text-center">Action</th>
                  <th className="py-4 px-4 font-semibold whitespace-nowrap text-center">N° Compte</th>
                  <th className="py-4 px-4 font-semibold whitespace-nowrap">Nom Client</th>
                  <th className="py-4 px-4 font-semibold whitespace-nowrap text-right">Ancien Ar</th>
                  <th className="py-4 px-4 font-semibold whitespace-nowrap text-right">Nouveau Ar</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 border-pink-50 hover:bg-pink-50/50 transition-colors">
                    <td className="py-4 px-4 text-xs font-medium text-gray-500 italic">
                      {new Date(a.date_modification).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-bold text-pink-700">
                      {a.utilisateur || "système"}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.type_action === 'INSERTION' ? 'bg-green-100 text-green-700' :
                        a.type_action === 'MODIFICATIO' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {a.type_action}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-800 font-mono">
                      {a.num_compte || "-"}
                    </td>
                    <td className="py-4 px-4 text-gray-800">
                      {a.nomclient || "-"}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-500 font-medium">
                      {a.solde_ancien !== null ? a.solde_ancien.toLocaleString() : "-"}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900 font-bold">
                      {a.solde_nouveau !== null ? a.solde_nouveau.toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {audit.length === 0 && (
              <div className="py-20 text-center text-pink-300 italic font-medium">
                Aucun audit n&apos;a encore été enregistré.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
