import { useMemo } from "react";
import { AppLayout } from "../components/AppLayout";
import { Settings, Package, CheckCircle, BarChart3, AlertTriangle } from "lucide-react";
import { LabCalendar } from "../components/LabCalendar";
import { useCalendarReservas } from "../services/useCalendarReservas";

const statsCards = [
  {
    title: "TOTAL DE PEDIDOS",
    subtitle: "Esta semana",
    value: "24",
    change: "+15% vs semana anterior",
    icon: Package,
    borderColor: "border-cyan-500",
  },
  {
    title: "PEDIDOS APROBADOS",
    subtitle: "Esta semana",
    value: "16",
    change: "87% del total de pedidos",
    icon: CheckCircle,
    borderColor: "border-blue-500",
  },
  {
    title: "USO DE EQUIPOS",
    subtitle: "Esta semana",
    value: "68%",
    change: "Promedio de utilización",
    icon: BarChart3,
    borderColor: "border-orange-500",
  },
  {
    title: "ALERTA DE FALTANTE DE STOCK",
    subtitle: "Requieren atención",
    value: "7",
    change: "Materiales críticos",
    icon: AlertTriangle,
    borderColor: "border-red-500",
  },
];

const equipmentUsage = [
  { name: "Microscopio Binocular", value: 85, hours: "34 h" },
  { name: "Centrífuga Refrigerada", value: 72, hours: "28 h" },
  { name: "Espectrofotómetro UV-Vis", value: 60, hours: "24 h" },
  { name: "Incubadora", value: 45, hours: "18 h" },
  { name: "Agitador Magnético", value: 30, hours: "12 h" },
];

const stockAlerts = [
  { name: "Puntas de micropipeta 200 μL", stock: "15 unts", status: "Crítico" },
  { name: "Tubos de ensayo 15 mL", stock: "20 unts", status: "Crítico" },
  { name: "Placas Petri 90 mm", stock: "35 unts", status: "Bajo" },
  { name: "Agar nutritivo", stock: "250 g", status: "Bajo" },
  { name: "Reactivo de Bradford", stock: "50 ml", status: "Bajo" },
];

export function Dashboard() {
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

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Uso de equipos - Esta semana</h2>
              <a href="#" className="text-blue-600 text-sm hover:text-blue-800">
                Ver todos los equipos →
              </a>
            </div>

            <div className="space-y-6">
              {equipmentUsage.map((item) => (
                <div key={item.name}>
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
              ))}
            </div>
          </div>

          {/* Stock alerts */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Alerta de faltante de stock</h2>
              <a href="#" className="text-blue-600 text-sm hover:text-blue-800">
                Ver todos los faltantes →
              </a>
            </div>

            <div className="space-y-3">
                {stockAlerts.map((item) => (
                  <div
                    key={item.name}
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
                ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;