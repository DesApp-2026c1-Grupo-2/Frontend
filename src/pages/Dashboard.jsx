import { AppLayout } from "../components/AppLayout";
import { Settings, Package, CheckCircle, BarChart3, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

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

const scheduleData = [
  {
    lab: "Lab. Biología 1",
    capacity: "Cap. 30 personas",
    schedule: [
      { time: "08:00 - 12:00", subject: "Disponible", status: "available" },
      { time: "09:00 - 13:00", subject: "Genética Molecular", status: "reserved" },
      { time: "14:00 - 18:00", subject: "Microbiología", status: "reserved-alt" },
      { time: "05:00 - 12:00", subject: "Disponible", status: "available" },
      { time: "10:00 - 17:00", subject: "Biología Celular", status: "reserved-alt" },
      { time: "", subject: "", status: "" },
      { time: "", subject: "", status: "" },
    ],
  },
  {
    lab: "Lab. Biología 2",
    capacity: "Cap. 25 personas",
    schedule: [
      { time: "13:00 - 17:00", subject: "Ecología", status: "reserved" },
      { time: "08:00 - 12:00", subject: "Disponible", status: "available" },
      { time: "08:00 - 12:00", subject: "Disponible", status: "available" },
      { time: "14:00 - 16:00", subject: "Ecología", status: "reserved" },
      { time: "08:00 - 13:00", subject: "Disponible", status: "available" },
      { time: "", subject: "", status: "" },
      { time: "", subject: "", status: "" },
    ],
  },
  {
    lab: "Lab. Química 1",
    capacity: "Cap. 30 personas",
    schedule: [
      { time: "08:00 - 13:00", subject: "Química Orgánica", status: "reserved" },
      { time: "14:00 - 18:00", subject: "Análisis Químico", status: "reserved" },
      { time: "13:00 - 17:00", subject: "Fisicoquímica", status: "reserved-alt" },
      { time: "08:00 - 13:00", subject: "Disponible", status: "available" },
      { time: "08:00 - 13:00", subject: "Química Analítica", status: "reserved" },
      { time: "", subject: "", status: "" },
      { time: "", subject: "", status: "" },
    ],
  },
  {
    lab: "Lab. Química 2",
    capacity: "Cap. 20 personas",
    schedule: [
      { time: "08:00 - 12:00", subject: "Disponible", status: "available" },
      { time: "13:00 - 17:00", subject: "Química Inorgánica", status: "reserved" },
      { time: "08:00 - 12:00", subject: "Disponible", status: "available" },
      { time: "14:00 - 16:00", subject: "Termodinámica", status: "reserved" },
      { time: "08:00 - 13:00", subject: "Disponible", status: "available" },
      { time: "", subject: "", status: "" },
      { time: "", subject: "", status: "" },
    ],
  },
  {
    lab: "Lab. Instrumental",
    capacity: "Cap. 15 personas",
    schedule: [
      { time: "14:00 - 18:00", subject: "Espectroscopía", status: "reserved" },
      { time: "08:00 - 12:00", subject: "Disponible", status: "available" },
      { time: "09:00 - 13:00", subject: "Cromatografía", status: "reserved" },
      { time: "08:00 - 16:00", subject: "Disponible", status: "available" },
      { time: "13:00 - 17:00", subject: "Microscopía", status: "reserved-alt" },
      { time: "", subject: "", status: "" },
      { time: "", subject: "", status: "" },
    ],
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

const days = ["LUN 19", "MAR 20", "MIÉ 21", "JUE 22", "VIE 23", "SÁB 24", "DOM 25"];

export function Dashboard() {
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
                className={`bg-white border ${card.borderColor} rounded-2xl p-6 shadow-lg`}
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
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Calendario de laboratorios - Vista semanal</h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">Hoy</span>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">19 - 25 de mayo de 2025</span>
              </div>
              <select className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700">
                <option>Todos los laboratorios</option>
              </select>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-700 pb-4 sticky left-0 bg-white">
                    Laboratorio
                  </th>
                  {days.map((day) => (
                    <th key={day} className="text-center text-xs font-semibold text-gray-700 pb-4 px-2">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((lab) => (
                  <tr key={lab.lab} className="border-t border-gray-200">
                    <td className="py-4 sticky left-0 bg-white">
                      <p className="font-medium text-sm text-gray-900">{lab.lab}</p>
                      <p className="text-xs text-gray-600">{lab.capacity}</p>
                    </td>
                    {lab.schedule.map((slot, idx) => (
                      <td key={idx} className="px-2 py-4">
                        {slot.time && (
                          <div
                            className={`text-xs p-2 rounded text-center font-semibold ${
                              slot.status === "available"
                                ? "bg-green-100 text-green-700"
                                : slot.status === "reserved"
                                ? "bg-blue-100 text-blue-700"
                                : slot.status === "reserved-alt"
                                ? "bg-orange-100 text-orange-700"
                                : ""
                            }`}
                          >
                            <p>{slot.time}</p>
                            <p>{slot.subject}</p>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-700">Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-700">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-gray-700">Reserva parcial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-gray-700">Mantenimiento</span>
            </div>
          </div>
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