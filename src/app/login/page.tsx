"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock } from "react-icons/fa";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirection en fonction du rôle (ou vers la liste par défaut)
        router.push("/liste");
        router.refresh();
      } else {
        setError(data.error || "Erreur lors de la connexion.");
      }
    } catch (err) {
      setError("Erreur serveur.");
    }
  };

  const handleInitDB = async () => {
    try {
      const res = await fetch("/api/auth/init");
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        alert("Erreur: " + data.error);
      }
    } catch {
      alert("Erreur serveur");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fdf2f8] items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-pink-100 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-300 to-pink-500 rounded-bl-full z-0 opacity-20" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-pink-300 to-pink-500 rounded-full z-0 opacity-20" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-8 text-pink-900 text-center">
            Connexion
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex items-center bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] rounded-full px-6 py-4 border border-gray-50">
              <FaUser className="text-pink-600 text-xl flex-shrink-0" />
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 ml-4 outline-none text-gray-700 bg-transparent font-medium placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] rounded-full px-6 py-4 border border-gray-50">
              <FaLock className="text-pink-600 text-xl flex-shrink-0" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 ml-4 outline-none text-gray-700 bg-transparent font-medium placeholder-gray-400"
                required
              />
            </div>

            {error && (
              <p className="text-center text-red-500 font-semibold bg-red-50 rounded-lg py-2 border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white font-bold rounded-full py-4 mt-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              SE CONNECTER
            </button>
          </form>

          <div className="mt-8 text-center border-t border-pink-100 pt-6">
            <button
              onClick={handleInitDB}
              className="text-sm font-medium text-pink-500 hover:text-pink-700 transition"
            >
              🛠 Initialiser la base de données (si 1ère fois)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
