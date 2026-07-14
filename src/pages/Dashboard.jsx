import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { usePedidos, useMateriales, useUsoEquipos } from "../services/useDashboardData";
import { useAuth } from "../context/AuthContext";

import DashboardBienvenida from "../components/dashboard/DashboardBienvenida";
import DashboardCalendario from "../components/dashboard/DashboardCalendario";
import DashboardPedidos from "../components/dashboard/DashboardPedidos";
import DashboardEquipamiento from "../components/dashboard/DashboardEquipamiento";
import UsuariosStatsCard from "../components/dashboard/UsuariosStatsCard";

import {
  Package,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";


// Umbral de "bajo stock" para materiales, alineado con el panel de alertas de
// la página de equipamiento (equipamiento.jsx: UMBRAL_STOCK_BAJO).
const UMBRAL_STOCK_BAJO = 5;

// Opciones del selector de período de la card "Uso de equipos".
const PERIODO_OPCIONES = [
  { value: "dia", label: "Día" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
];

const PERIODO_LABEL = {
  dia: "Día actual",
  semana: "Semana actual",
  mes: "Mes actual",
};

// Formatea el rango efectivo [desde, hasta) que devuelve el backend. `hasta` es
// exclusivo, así que restamos 1 día para mostrar el último día real del período.
const formatRangoPeriodo = (desde, hasta) => {
  if (!desde || !hasta) return "";
  const fmt = (d) => d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
  const inicio = new Date(desde);
  const fin = new Date(hasta);
  fin.setDate(fin.getDate() - 1);
  const mismaFecha = inicio.toDateString() === fin.toDateString();
  return mismaFecha ? fmt(inicio) : `${fmt(inicio)} al ${fmt(fin)}`;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { pedidos, loading: loadingPedidos } = usePedidos();
  //misPedidos para docente
  const misPedidos = pedidos.filter(
    (p) => p.docente?._id === user?._id
  );

  const pedidosPendientes = misPedidos.filter(
    (p) =>
      p.estado === "Pendiente"
  ).length;

  const pedidosAprobados = misPedidos.filter(
    (p) =>
      p.estado === "Aceptado" ||
      p.estado === "Aprobado"
  ).length;
  const { materiales, loading: loadingMat } = useMateriales();

  // Período del ranking (Top 5) de uso de equipos: "dia" | "semana" | "mes".
  const [periodo, setPeriodo] = useState("mes");
  const esMes = periodo === "mes";
  const { estadisticas, loading: loadingUso } = useUsoEquipos(periodo);
  // La stat card superior muestra SIEMPRE el total del mes, independiente del
  // selector del Top 5. Si el Top 5 ya está en "mes", reutilizamos esa misma
  // data en vez de disparar una segunda consulta idéntica.
  const { estadisticas: usoMensualSeparado, loading: loadingMensualSeparado } = useUsoEquipos("mes", { enabled: !esMes });
  const usoMensual = esMes ? estadisticas : usoMensualSeparado;
  const loadingUsoMensual = esMes ? loadingUso : loadingMensualSeparado;


  // --- PROCESAMIENTO REACTIVO DE DATOS ---

  // Top 5 equipos más usados del período (el backend ya los devuelve ordenados
  // por `usos` desc).
  const equipmentUsage = useMemo(
    () => estadisticas.equipos.slice(0, 5),
    [estadisticas.equipos]
  );


  // Materiales con stock disponible <= UMBRAL_STOCK_BAJO, ordenados de menor a
  // mayor (los más críticos primero), igual que el panel de equipamiento.
  const stockAlerts = useMemo(() => {
    return materiales
      .filter((m) => (m.stockDisponible ?? m.stock ?? 0) <= UMBRAL_STOCK_BAJO)
      .sort((a, b) => (a.stockDisponible ?? a.stock ?? 0) - (b.stockDisponible ?? b.stock ?? 0));
  }, [materiales]);


  // Verificamos si el usuario tiene un rol válido para ver el Dashboard
  const canViewDashboard = user?.rol?.toUpperCase() === "PERSONAL" || user?.rol?.toUpperCase() === "ADMIN";


  return (
      <AppLayout>

      {user?.rol === "DOCENTE" && (

        <div className="space-y-8">

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">

            <DashboardBienvenida />

            <DashboardPedidos
              totalPedidos={misPedidos.length}
              pedidosAprobados={pedidosAprobados}
            />

          </div>

          <DashboardCalendario />

        </div>

      )}

      {user?.rol === "PERSONAL" && (

        <div className="space-y-8">

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">

            <DashboardBienvenida />

            <DashboardPedidos
              totalPedidos={pedidos.length}
              pedidosAprobados={
                pedidos.filter(
                  (p) =>
                    p.estado === "Aprobado" ||
                    p.estado === "Aceptado"
                ).length
              }
            />

          </div>

          <DashboardCalendario />

          <DashboardEquipamiento
            periodo={periodo}
            setPeriodo={setPeriodo}
            estadisticas={estadisticas}
            equipmentUsage={equipmentUsage}
            stockAlerts={stockAlerts}
            loadingUso={loadingUso}
            loadingMat={loadingMat}
            formatRangoPeriodo={formatRangoPeriodo}
            periodoLabel={PERIODO_LABEL}
            umbralStock={UMBRAL_STOCK_BAJO}
          />

        </div>

      )}

      {user?.rol === "ADMIN" && (

        <div className="space-y-8">

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
            <DashboardBienvenida />

            <UsuariosStatsCard />

          </div>

          <DashboardCalendario />

          <DashboardEquipamiento
            periodo={periodo}
            setPeriodo={setPeriodo}
            estadisticas={estadisticas}
            equipmentUsage={equipmentUsage}
            stockAlerts={stockAlerts}
            loadingUso={loadingUso}
            loadingMat={loadingMat}
            formatRangoPeriodo={formatRangoPeriodo}
            periodoLabel={PERIODO_LABEL}
            umbralStock={UMBRAL_STOCK_BAJO}
          />

        </div>

      )}
    </AppLayout>
  );
}


export default Dashboard;
