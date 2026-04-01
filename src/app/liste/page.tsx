"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";

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
  const [userRole, setUserRole] = useState<string>("user");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalNom, setModalNom] = useState("");
  const [modalSolde, setModalSolde] = useState("");

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
    const fetchGlobalData = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserRole(userData.user.role);
        }
      } catch (err) {
        console.error("User fetch error:", err);
      }
      chargerComptes();
    };
    fetchGlobalData();
  }, []);

  const sauvegarderCompte = async () => {
    if (!nomclient || !solde) {
      setMessage("Veuillez remplir tous les champs !");
      return;
    }
    try {
      const res = await fetch("/api/comptes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomclient, solde: parseFloat(solde) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Compte ajouté !");
        setNomclient("");
        setSolde("");
        chargerComptes();
      } else {
        setMessage(data.error || "Erreur serveur");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur");
    }
  };

  const ouvrirModaleModification = (c: Compte) => {
    setEditingId(c.num_compte);
    setModalNom(c.nomclient);
    setModalSolde(c.solde.toString());
    setShowModal(true);
  };

  const sauvegarderModification = async () => {
    if (!modalNom || !modalSolde) {
      setMessage("Veuillez remplir tous les champs !");
      return;
    }
    try {
      const res = await fetch("/api/comptes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num_compte: editingId, nomclient: modalNom, solde: parseFloat(modalSolde) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Compte modifié !");
        setEditingId(null);
        setShowModal(false);
        setModalNom("");
        setModalSolde("");
        chargerComptes();
      } else {
        setMessage(data.error || "Erreur serveur");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur");
    }
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
    <div className="flex min-h-screen bg-[#fdf2f8]">
      {/* Sidebar importée */}
      <Sidebar />
      {/* Décaler le contenu principal à droite de la sidebar */}
      <div className="flex-1 ml-56 flex flex-col items-center">
        <div className="w-full max-w-5xl p-10 pt-20">
      
          <h2 className="text-3xl font-bold mb-8 text-pink-900 text-center lg:text-left">
            Liste des comptes
          </h2>

          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-pink-100 w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-pink-100 text-pink-900">
                    <th className="py-4 px-6 font-semibold">Nom du client</th>
                    <th className="py-4 px-6 font-semibold text-right">Solde</th>
                    {userRole !== "admin" && <th className="py-4 px-6 font-semibold text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {comptes.map((c) => (
                    <tr key={c.num_compte} className="border-b last:border-0 border-pink-50 hover:bg-pink-50/50 transition-colors">
                      <td className="py-4 px-6 text-gray-800 font-medium">{c.nomclient}</td>
                      <td className="py-4 px-6 text-gray-700 text-right font-bold">{c.solde.toLocaleString()} Ar</td>
                      {userRole !== "admin" && (
                        <td className="py-4 px-6 flex justify-center gap-3">
                          <button
                            onClick={() => ouvrirModaleModification(c)}
                            className="bg-pink-100 text-pink-600 hover:bg-pink-200 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm"
                          >
                            <FaEdit /> Modifier
                          </button>
                          <button
                            onClick={() => supprimerCompte(c.num_compte)}
                            className="bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm"
                          >
                            <FaTrash /> Supprimer
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {comptes.length === 0 && (
                <div className="py-12 text-center text-gray-500 font-medium">
                  Aucun compte trouvé.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de modification */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
              <h2 className="text-2xl font-bold mb-8 text-pink-900 text-center">Modifier le compte</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                  <input
                    type="text"
                    placeholder="Nom du client"
                    value={modalNom}
                    onChange={(e) => setModalNom(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-gray-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solde</label>
                  <input
                    type="number"
                    placeholder="Solde"
                    value={modalSolde}
                    onChange={(e) => setModalSolde(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-gray-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 font-medium rounded-full transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={sauvegarderModification}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white font-bold rounded-full shadow-md transition-all hover:-translate-y-0.5"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}