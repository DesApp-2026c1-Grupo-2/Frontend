import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { LabCalendar } from "../components/LabCalendar";
import { useCalendarReservas } from "../services/useCalendarReservas";
import { usePedidos, useMateriales, useUsoEquipos } from "../services/useDashboardData";
import { useAuth } from "../context/AuthContext";

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


  // Calculamos fechas iniciales por defecto (la semana actual de domingo a sábado)
  const { initialStart, initialEnd } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      initialStart: start.toISOString().split("T")[0],
      initialEnd: end.toISOString().split("T")[0]
    };
  }, []);


  const { eventosLabCalendar, loading, handleDateRangeChange, dateRange } = useCalendarReservas(initialStart, initialEnd);


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


  // Total de usos (reservas finalizadas) del mes, sumando el ranking mensual.
  const totalUsos = useMemo(
    () => usoMensual.equipos.reduce((acc, eq) => acc + (eq.usos ?? 0), 0),
    [usoMensual.equipos]
  );


  const statsCards = useMemo(() => {
    const aprobados = pedidos.filter(p => p.estado === "Aprobado" || p.estado === "Aceptado").length;
    const totalPedidos = pedidos.length;


    const alertasStockCount = materiales.filter(m => (m.stockDisponible ?? m.stock ?? 0) <= UMBRAL_STOCK_BAJO).length;


    return [
      {
        title: "TOTAL DE PEDIDOS",
        subtitle: "Global",
        value: totalPedidos.toString(),
        change: "Total histórico",
        icon: Package,
        borderColor: "border-cyan-500",
      },
      {
        title: "PEDIDOS APROBADOS",
        subtitle: "Global",
        value: aprobados.toString(),
        change: totalPedidos ? `${Math.round((aprobados / totalPedidos) * 100)}% del total` : "0% del total",
        icon: CheckCircle,
        borderColor: "border-blue-500",
      },
      {
        title: "USO DE EQUIPOS",
        subtitle: "Mes actual",
        value: totalUsos.toString(),
        change: "Reservas finalizadas",
        icon: BarChart3,
        borderColor: "border-orange-500",
      },
      {
        title: "ALERTA DE STOCK",
        subtitle: "Requieren atención",
        value: alertasStockCount.toString(),
        change: "Materiales críticos y bajos",
        icon: AlertTriangle,
        borderColor: "border-red-500",
      },
    ];
  }, [pedidos, materiales, totalUsos]);


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
      {!canViewDashboard ? (
        //vista docente
        <div className="max-w-5xl mx-auto space-y-12">


          {/* Bienvenida */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold font-['Playfair_Display',serif] text-emerald-800">
              Hola, {user?.nombre} 👋
            </h1>


            <p className="mt-2 text-slate-600">
              Bienvenido al sistema de gestión de laboratorios.
            </p>
          </div>


          {/* Mis pedidos */}
          <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mt-20">


            {/* Techo */}
            <div className="absolute -top-4 left-10 right-10 h-5 bg-stone-700 rounded-t-2xl" />


            <div className="flex items-start justify-between gap-4">


              <div>
                <div className="flex items-center gap-3">


                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                    <ClipboardList className="h-6 w-6 text-emerald-700" />
                  </div>


                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-slate-800">
                      Mis Pedidos
                    </h2>


                    <p className="text-slate-600 text-sm">
                      Consultá el estado de tus solicitudes y realizá nuevos pedidos.
                    </p>
                  </div>


                  {misPedidos.length === 0 && (
                    <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <p className="text-sm text-slate-600">
                        Todavía no registraste pedidos de laboratorio.
                      </p>
                    </div>
                  )}
                </div>
              </div>


              <button
                onClick={() => navigate("/pedidos")}
                className="
                  px-5 py-2.5 rounded-xl
                  bg-emerald-600 text-white
                  hover:bg-emerald-700
                  transition
                "
              >
                Ver pedidos
              </button>


            </div>


            <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-200 pt-6">


              <div>
                <p className="text-sm text-slate-500">
                  Pedidos realizados
                </p>


                <p className="text-2xl font-bold text-slate-800">
                  {misPedidos.length}
                </p>
              </div>


              <div>
                <p className="text-sm text-yellow-700">
                  Pendientes
                </p>


                <p className="text-2xl font-bold text-yellow-800">
                  {pedidosPendientes}
                </p>
              </div>


              <div>
                <p className="text-sm text-emerald-700">
                  Aprobados
                </p>


                <p className="text-2xl font-bold text-emerald-800">
                  {pedidosAprobados}
                </p>
              </div>


            </div>


          </div>


        </div>
      ) : (
        <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {(loadingPedidos || loadingUsoMensual || loadingMat) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          )}
              {statsCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className={`bg-white border border-gray-200 ${card.borderColor} rounded-2xl p-6 shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">{card.title}</p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  </div>
                  <IconComponent className="w-6 h-6 text-gray-400" />
                </div>
                <div className="mb-3">
                  <p className="text-4xl font-bold text-gray-900">{card.value}</p>
                </div>
                <p className="text-xs text-gray-600">
                  {card.change.startsWith("+") ? (
                    <span className="text-green-600">📈 {card.change}</span>
                  ) : (
                    card.change
                  )}
                </p>
              </div>
            );
          })}
        </div>


        {/* Calendar Section */}
        <div className="relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          )}
          <LabCalendar
            scheduleData={eventosLabCalendar}
            dateRange={dateRange}
            onDateChange={handleDateRangeChange}
          />
        </div>


        {/* Bottom sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Equipment usage */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg relative min-h-[200px]">
            {loadingUso && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
              </div>
            )}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Uso de equipos (Top 5)</h2>
                {formatRangoPeriodo(estadisticas.desde, estadisticas.hasta) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {(PERIODO_LABEL[periodo] ?? "Período").replace(" actual", "")} del{" "}
                    {formatRangoPeriodo(estadisticas.desde, estadisticas.hasta)}
                  </p>
                )}
              </div>
              {/* Selector de período */}
              <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-0.5">
                {PERIODO_OPCIONES.map((op) => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setPeriodo(op.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                      periodo === op.value
                        ? "bg-white text-cyan-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>


            <div className="space-y-3">
              {equipmentUsage.length > 0 ? (
                equipmentUsage.map((item, idx) => (
                  <div
                    key={item.equipoId ?? idx}
                    className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.nombre || "Equipo desconocido"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {[item.codigo, item.tipo].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                      {item.usos} {item.usos === 1 ? "uso" : "usos"}
                    </span>
                  </div>
                ))
              ) : (
                !loadingUso && <p className="text-sm text-gray-500 text-center py-4">No hay usos registrados en el período.</p>
              )}
            </div>
          </div>


          {/* Stock alerts */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg relative min-h-[200px]">
            {loadingMat && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
              </div>
            )}
            <div className="mb-4">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h2 className="text-2xl font-semibold text-gray-900">Alerta de faltante de stock</h2>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                  {stockAlerts.length} bajo stock
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Materiales con stock disponible igual o menor a {UMBRAL_STOCK_BAJO} unidades.
              </p>
            </div>


            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {stockAlerts.length > 0 ? (
                stockAlerts.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="rounded-xl border border-amber-200 bg-amber-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{item.nombre || "Material desconocido"}</span>
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                            Bajo stock
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          Código {item.codigo} · {item.stockDisponible ?? item.stock ?? 0} {item.unidad}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !loadingMat && <p className="text-sm text-gray-500 text-center py-4">No hay materiales con bajo stock.</p>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </AppLayout>
  );
}


export default Dashboard;
