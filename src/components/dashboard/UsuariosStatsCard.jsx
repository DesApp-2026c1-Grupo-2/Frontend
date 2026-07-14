import { useEffect, useState } from "react";
import { FiUsers, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import {
  obtenerUsuarios,
  obtenerUsuariosPendientes,
} from "../../services/usuarioService";

export default function UsuariosStatsCard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    activos: 0,
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const [todos, pendientes] = await Promise.all([
          obtenerUsuarios({ limit: 1 }),
          obtenerUsuariosPendientes({ limit: 1 }),
        ]);

        setStats({
          total: todos.total,
          pendientes: pendientes.total,
          activos: Math.max(
            todos.total - pendientes.total,
            0
          ),
        });
      } catch (err) {
        console.error(err);
      }
    };

    cargar();
  }, []);

  return (
    <div className="h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-5 sm:px-6 py-5 border-b border-slate-100">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">

            <FiUsers
              size={22}
              className="text-emerald-700"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Usuarios
            </h2>

            <p className="text-sm text-slate-500">
              Gestión de cuentas del sistema.
            </p>

          </div>

        </div>

        <button
          onClick={() => navigate("/aprobacion-usuarios")}
          className="
            self-start sm:self-auto
            flex items-center gap-2
            text-sm
            font-medium
            text-emerald-700
            hover:text-emerald-800
            transition
          "
        >
          Ver usuarios

          <FiArrowRight />
        </button>

      </div>

      {/* Body */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5">

          <p className="text-sm text-slate-500">
            Total
          </p>

          <p className="mt-2 text-2xl lg:text-3xl font-bold text-slate-800">
            {stats.total}
          </p>

        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5">

          <p className="text-sm text-amber-700">
            Pendientes
          </p>

          <p className="mt-2 text-2xl lg:text-3xl font-bold text-amber-800">
            {stats.pendientes}
          </p>

        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5">

          <p className="text-sm text-emerald-700">
            Activos
          </p>

          <p className="mt-2 text-2xl lg:text-3xl font-bold text-emerald-800">
            {stats.activos}
          </p>

        </div>

      </div>

    </div>
  );
}