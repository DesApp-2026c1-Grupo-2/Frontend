import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/SharedUi";
import { ModuleCard } from "../components/ModuleCard";
import { LabIcon, InventoryIcon, EquipmentIcon, OrdersIcon } from "../components/icons";

const modulesData = [
  { id: "laboratorio", label: "Laboratorio", description: "Laboratorios Universitarios", stats: "5 Laboratorios Disponibles", icon: <LabIcon /> },
  { id: "inventario", label: "Inventario", description: "Control de stock y materiales del laboratorio", stats: "50 productos en stock", icon: <InventoryIcon /> },
  { id: "equipamiento", label: "Equipamiento", description: "Gestión y mantenimiento de equipo", stats: "24 equipos registrados", icon: <EquipmentIcon /> },
  { id: "pedidos", label: "Pedidos", description: "Solicitudes de reserva de laboratorios", stats: "2 pedidos pendientes", icon: <OrdersIcon /> },
];

const moduleColors = {
  laboratorio: { title: "Laboratorio", color: "from-green-600 to-green-800" },
  inventario: { title: "Inventario", color: "from-green-700 to-green-900" },
  equipamiento: { title: "Equipamiento", color: "from-emerald-600 to-green-800" },
  pedidos: { title: "Pedidos", color: "from-teal-600 to-green-800" },
};


function DashboardGrid() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <PageHeader 
        preTitle="Sistema de Gestión"
        title="Panel de Control"
        description="Seleccioná un módulo para acceder a su gestión completa."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
        {modulesData.map((mod, i) => (
          <ModuleCard 
            key={mod.id}
            title={mod.label}
            description={mod.description}
            stats={mod.stats}
            icon={mod.icon}
            delayIndex={i + 1}
            onClick={() => navigate(`/modulo/${mod.id}`)}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 72, paddingTop: 32, borderTop: "1px solid #dcfce7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#16a34a", fontSize: 13 }}>© 2026 Sistema de Gestión Clínica</span>
      </div>
    </AppLayout>
  );
}

function ModulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageInfo = moduleColors[id];

  if (!pageInfo) return <div>Módulo no encontrado</div>;

  return (
    <AppLayout>
      <div className={`w-full max-w-lg mx-auto mt-20 rounded-3xl bg-gradient-to-br ${pageInfo.color} p-12 text-white text-center shadow-2xl`}>
        <p className="text-green-200 text-sm font-medium uppercase tracking-widest mb-4">Módulo</p>
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          {pageInfo.title}
        </h1>
        <p className="text-green-100 mb-10 text-base leading-relaxed">
          Este módulo está en construcción.<br />Próximamente disponible.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-all duration-200 text-white font-semibold px-6 py-3 rounded-xl backdrop-blur-sm"
        >
          Volver al Dashboard
        </button>
      </div>
    </AppLayout>
  );
}

export default function Dashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardGrid />} />
      <Route path="/modulo/:id" element={<ModulePage />} />
    </Routes>
  );
}