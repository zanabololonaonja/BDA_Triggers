"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { FaUser, FaWallet, FaCoins } from "react-icons/fa";
import { useRouter } from 'next/navigation';

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
  // const [editingId, setEditingId] = useState<number | null>(null);
  // const [showModal, setShowModal] = useState(false);
  // const [modalNom, setModalNom] = useState("");
  // const [modalSolde, setModalSolde] = useState("");

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

  const router = useRouter();
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

        // On attend un tout petit peu pour que l'utilisateur voit le message de succès
        setTimeout(() => {
          router.push('/liste'); // Remplace '/liste' par le bon chemin vers ta page
        }, 1500);

      } else {
        setMessage(data.error || "Erreur serveur");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fdf2f8]">
      <Sidebar />

      <div className="flex-1 ml-56 p-10 pt-20 flex flex-col items-center justify-center">


        {/* Form Container */}
        <div className="w-full max-w-md bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-pink-100 relative overflow-hidden">
          {/* Subtle shapes mimicking the image but localized to the form card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-300 to-pink-500 rounded-bl-full z-0 opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-pink-300 to-pink-500 rounded-full z-0 opacity-20"></div>

          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-6 text-pink-900 text-center">
              Ajouter un Compte
            </h2>

            <div className="space-y-6">
              <div className="flex items-center bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] rounded-full px-6 py-4 border border-gray-50">
                <FaUser className="text-pink-600 text-xl flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Nom du client"
                  value={nomclient}
                  onChange={(e) => setNomclient(e.target.value)}
                  className="flex-1 ml-4 outline-none text-gray-700 bg-transparent font-medium placeholder-gray-400"
                />
              </div>

              <div className="flex items-center bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] rounded-full px-6 py-4 border border-gray-50 relative">
                <FaWallet className="text-pink-600 text-xl flex-shrink-0" />
                <input
                  type="number"
                  placeholder="Solde"
                  value={solde}
                  onChange={(e) => setSolde(e.target.value)}
                  className="flex-1 ml-4 outline-none text-gray-700 bg-transparent font-medium placeholder-gray-400 pl-2 pr-6"
                />
                <FaCoins className="text-pink-400 text-lg absolute right-6" />
              </div>

              <button
                onClick={sauvegarderCompte}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white font-bold rounded-full py-4 mt-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                AJOUTER
              </button>
            </div>

            {message && (
              <p className="mt-6 text-center text-pink-600 font-semibold bg-white rounded-lg py-2 shadow-sm border border-pink-100">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}