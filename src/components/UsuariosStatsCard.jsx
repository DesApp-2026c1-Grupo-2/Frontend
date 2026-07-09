// ⚠️ COMPONENTE TEMPORAL — solo para previsualizar en el Dashboard.
// Para borrarlo: eliminar este archivo y su import/uso en src/pages/Dashboard.jsx.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { obtenerUsuarios, obtenerUsuariosPendientes } from "../services/usuarioService";

export default function UsuariosStatsCard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pendientes: 0, activos: 0 });

  useEffect(() => {
    const fetchUsuariosStats = async () => {
      try {
        // Conteos desde la metadata `total` (con limit:1 solo traemos el total,
        // no toda la lista). Activos = total − pendientes.
        const [resTodos, resPend] = await Promise.all([
          obtenerUsuarios({ limit: 1 }),
          obtenerUsuariosPendientes({ limit: 1 }),
        ]);
        setStats({
          total: resTodos.total,
          pendientes: resPend.total,
          activos: Math.max(resTodos.total - resPend.total, 0),
        });
      } catch (error) {
        console.error("Error al cargar estadísticas de usuarios:", error.message);
      }
    };
    fetchUsuariosStats();
  }, []);

  return (
    <div
      onClick={() => navigate("/aprobacion-usuarios")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/aprobacion-usuarios")}
      className="bg-white border border-emerald-500 rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-600 font-semibold">SOLICITUDES DE USUARIOS</p>
          <p className="text-xs text-gray-500">Cuentas registradas</p>
        </div>
        <Users className="w-6 h-6 text-gray-400" />
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div>
          <p className="text-xs text-yellow-700">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pendientes}</p>
        </div>
        <div>
          <p className="text-xs text-emerald-700">Activos</p>
          <p className="text-2xl font-bold text-emerald-800">{stats.activos}</p>
        </div>
      </div>
    </div>
  );
}
