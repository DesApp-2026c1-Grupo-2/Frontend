//import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { useNavigate } from "react-router-dom";
import imagenEdificios from "../assets/imagenEdificios.png";
import { edificios } from "../data/edificios";

//import { LabIcon, InventoryIcon, EquipmentIcon, OrdersIcon } from "../components/icons";

/*
const modulesData = [
  { id: "laboratorios", label: "Laboratorio", description: "Laboratorios Universitarios", stats: "5 Laboratorios Disponibles", icon: <LabIcon /> },
  { id: "inventario", label: "Inventario", description: "Control de stock y materiales del laboratorio", stats: "50 productos en stock", icon: <InventoryIcon /> },
  { id: "equipamiento", label: "Equipamiento", description: "Gestión y mantenimiento de equipo", stats: "24 equipos registrados", icon: <EquipmentIcon /> },
  { id: "pedidos", label: "Pedidos", description: "Solicitudes de reserva de laboratorios", stats: "2 pedidos pendientes", icon: <OrdersIcon /> },
];
const moduleColors = {
  laboratorio: { title: "Laboratorio", color: "from-green-600 to-green-800" },
  inventario: { title: "Inventario", color: "from-green-700 to-green-900" },
  equipamiento: { title: "Equipamiento", color: "from-emerald-600 to-green-800" },
  pedidos: { title: "Pedidos", color: "from-teal-600 to-green-800" },
};*/

/*
function DashboardGrid() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <PageHeader 
        preTitle="Sistema de Gestión"
        title="Panel de Control"
        description="Seleccioná un módulo para acceder a su gestión completa."
      />

      //{/* Grid refactorizado a Tailwind }*/
      /*
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
        {modulesData.map((mod, i) => (
          <ModuleCard 
            key={mod.id}
            title={mod.label}
            description={mod.description}
            stats={mod.stats}
            icon={mod.icon}
            delayIndex={i + 1}
            onClick={() => navigate(`/${mod.id}`)}
          />
        ))}
      </div>*/
      //{/* Footer refactorizado a Tailwind */}
      /*
      <div className="mt-[72px] pt-8 border-t border-green-100 flex justify-between items-center">
        <span className="text-green-600 text-[13px]">© 2026 Sistema de Gestión Clínica</span>
      </div>
    </AppLayout>
  )
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
        <h1 className="text-5xl font-bold mb-4 font-['Playfair_Display']">
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
      <Route path="/:id" element={<ModulePage />} />
    </Routes>
  );
}*/

function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <div className="w-screen h-[calc(100vh-70px)] overflow-hidden relative">

        {/* Fondo */}
        <img
          src={imagenEdificios}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Edificios */}
        {edificios.map((ed, i) => {
          const deshabilitado = ed.disponibles === 0;

          return (
            <div
              key={i}
              onClick={() => {
                if (!deshabilitado) {
                  navigate(ed.ruta);
                }
              }}
              className={`
                absolute ${ed.position} w-[28%] h-[18%]
                rounded-xl border-2 p-3 flex flex-col justify-between
                transition duration-200 backdrop-blur-sm

                ${
                  deshabilitado
                    ? "bg-gray-400/75 border-gray-400 cursor-not-allowed"
                    : "bg-green-500/75 border-green-500 hover:bg-green-500/40 cursor-pointer"
                }
              `}
            >
              {/* Nombre */}
              <p className="text-sm font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">
                {ed.nombre}
              </p>

              {/* Info */}
              <div className="text-xs text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
                <p>Total: {ed.total}</p>
                <p>Disponibles: {ed.disponibles}</p>
              </div>
            </div>
          );
        })}

      </div>
    </>
  );
}

export default Dashboard;