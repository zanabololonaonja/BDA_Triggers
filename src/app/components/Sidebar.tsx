"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser, FaUserShield, FaList, FaBars, FaCog } from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>("user");
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUserRole(data.user.role);
      })
      .catch(() => { });
  }, []);

  React.useEffect(() => {
    if (userRole === "admin") {
      fetch("/api/audit")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const latestId = data[0].id; // Dernier audit (le plus récent)
            
            if (pathname === "/admin") {
               // Si on est sur la page Admin, on a tout vu
              localStorage.setItem("lastSeenAuditId", latestId.toString());
              setUnreadCount(0);
            } else {
              const lastSeen = parseInt(localStorage.getItem("lastSeenAuditId") || "0", 10);
              const unread = data.filter((d: any) => d.id > lastSeen).length;
              setUnreadCount(unread);
            }
          }
        })
        .catch(() => {});
    }
  }, [userRole, pathname]);

  const menu = [
    { to: "/", icon: <FaUser />, label: "Utilisateur", showTo: ["user"] },
    { to: "/admin", icon: <FaUserShield />, label: "Audit", showTo: ["admin"] },
    { to: "/liste", icon: <FaList />, label: "Liste des comptes", showTo: ["admin", "user"] },
  ].filter(item => item.showTo.includes(userRole));

  return (
    <>
      <button
        className="fixed top-4 left-4 z-30 bg-pink-900 text-white p-2 rounded-lg shadow-lg focus:outline-none lg:left-72 transition-all"
        style={{ left: collapsed ? "4rem" : "16.5rem" }}
        onClick={() => setCollapsed((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <FaBars className="text-2xl" />
      </button>

      <aside
        className={`fixed left-0 top-0 h-full ${collapsed ? "w-16" : "w-64"
          } bg-pink-900 flex flex-col z-20 shadow-xl transition-all duration-300`}
        style={{ minWidth: collapsed ? "4rem" : "16rem" }}
      >
        <div className={`flex items-center text-[#ffffff] text-xl justify-center h-16 mt-2`}>
          <h1>BDA-Triggers</h1>
        </div>

        <nav className="flex-1 flex flex-col pt-4">
          {menu.map((item) => {
            const isActive = pathname === item.to;
            return (
              <div key={item.to} className="relative pl-2">
                <Link
                  href={item.to}
                  className={`flex items-center ${collapsed ? "justify-center" : "gap-4 px-6"
                    } py-4 font-bold transition-all duration-300 relative ${isActive
                      ? "bg-rose-50 text-pink-900 rounded-l-[40px]"
                      : "text-[#ffffff] hover:bg-white/20 rounded-l-[40px]"
                    }`}
                  title={item.label}
                >
                  <span className="text-xl relative">
                    {item.icon}
                    {item.to === "/admin" && unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-pink-900">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </span>
                  {!collapsed && item.label}

                  {isActive && !collapsed && (
                    <>
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div
          className={`mt-auto pb-6 flex flex-col gap-4 ${collapsed ? "pl-0 items-center" : "pl-10 items-start"
            }`}
        >

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className={`flex items-center gap-3 text-[#ffffff] font-bold hover:text-red-100 transition`}
            title="Déconnexion"
          >
            <FaUserShield className="text-xl" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
