import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { LabCalendar } from "../components/LabCalendar";
import { useCalendarReservas } from "../services/useCalendarReservas";
import { usePedidos, useEquipamiento, useMateriales } from "../services/useDashboardData";
import { useAuth } from "../context/AuthContext";

import {
  Package,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

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
      p.estado === "Pendiente" ||
      p.estado === "En Revisión"
  ).length;

  const pedidosAprobados = misPedidos.filter(
    (p) =>
      p.estado === "Aceptado" ||
      p.estado === "Aprobado"
  ).length;
  const { equipamiento, loading: loadingEquip } = useEquipamiento();
  const { materiales, loading: loadingMat } = useMateriales();

  // --- PROCESAMIENTO REACTIVO DE DATOS ---

  const statsCards = useMemo(() => {
    const aprobados = pedidos.filter(p => p.estado === "Aprobado" || p.estado === "Aceptado").length;
    const totalPedidos = pedidos.length;

    // Si no viene 'porcentajeUso', aplicamos un default de 0
    const usoPromedio = equipamiento.length > 0
      ? Math.round(equipamiento.reduce((acc, eq) => acc + (eq.porcentajeUso ?? eq.uso ?? 0), 0) / equipamiento.length)
      : 0;

    const alertasStockCount = materiales.filter(m => (m.stock ?? m.cantidad ?? 0) <= (m.stockMinimo ?? 20)).length;

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
        subtitle: "Promedio general",
        value: `${usoPromedio}%`,
        change: "Promedio de utilización",
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
  }, [pedidos, equipamiento, materiales]);

  const equipmentUsage = useMemo(() => {
    return equipamiento
      .map((eq) => {
        const value = eq.porcentajeUso ?? eq.uso ?? 0;
        // Criterio: si no hay horasUso, estimamos basado en el % sobre una semana estandar de 40h
        const hours = eq.horasUso ?? Math.round((value / 100) * 40);
        return {
          name: eq.nombre || eq.tipo || "Equipo Desconocido",
          value,
          hours: `${hours} h`,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Tomamos el top 5
  }, [equipamiento]);

  const stockAlerts = useMemo(() => {
    return materiales
      .filter((m) => (m.stock ?? m.cantidad ?? 0) <= (m.stockMinimo ?? 20))
      .map((m) => {
        const qty = m.stock ?? m.cantidad ?? 0;
        return {
          name: m.nombre || m.tipo || "Material Desconocido",
          stock: `${qty} ${m.unidad || 'unts'}`,
          status: qty <= (m.stockCritico ?? 5) ? "Crítico" : "Bajo",
        };
      })
      .sort((a) => (a.status === "Crítico" ? -1 : 1))
      .slice(0, 5); // Tomamos el top 5
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
          {(loadingPedidos || loadingEquip || loadingMat) && (
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
            {loadingEquip && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
              </div>
            )}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Uso de equipos (Top 5)</h2>
              <a href="/equipamiento" className="text-blue-600 text-sm hover:text-blue-800">
                Ver todos los equipos →
              </a>
            </div>

            <div className="space-y-6">
              {equipmentUsage.length > 0 ? (
                equipmentUsage.map((item, idx) => (
                <div key={`${item.name}-${idx}`}>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-900">{item.name}</span>
                    <div className="flex gap-4 text-gray-600 text-xs">
                      <span>{item.value}%</span>
                      <span>{item.hours}</span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
                ))
              ) : (
                !loadingEquip && <p className="text-sm text-gray-500 text-center py-4">No hay datos de equipos registrados.</p>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Alerta de faltante de stock</h2>
              <a href="/equipamiento" className="text-blue-600 text-sm hover:text-blue-800">
                Ver todos los faltantes →
              </a>
            </div>

            <div className="space-y-3">
              {stockAlerts.length > 0 ? (
                stockAlerts.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.name}</p>
                      <span className="text-xs text-gray-600">Stock actual: {item.stock}</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        item.status === "Crítico"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                !loadingMat && <p className="text-sm text-gray-500 text-center py-4">Inventario saludable, sin alertas.</p>
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