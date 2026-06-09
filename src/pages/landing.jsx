// pages/Landing.jsx
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      {/* Navbar simple */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between sm:px-6 lg:px-8">
          <div className="text-xl font-bold text-emerald-700">SysLab</div>
          <button
            onClick={() => navigate("/logIn")}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Contenido */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                ✨ Sistema de gestión
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Gestión de Equipamiento y Laboratorios
              </h1>
              <p className="text-xl text-slate-600">
                Controla tu inventario de equipos, materiales y reactivos de forma centralizada y eficiente.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Inventario completo</h3>
                  <p className="text-slate-600">Gestiona equipos, materiales, reactivos y sustancias en un solo lugar</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Control de ubicaciones</h3>
                  <p className="text-slate-600">Organiza por edificios, laboratorios y ubicaciones específicas</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Reportes y alertas</h3>
                  <p className="text-slate-600">Monitorea el estado del equipo y recibe alertas de mantenimiento</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button
                onClick={() => navigate("/logIn")}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl"
              >
                Comenzar →
              </button>
            </div>
          </div>

          {/* Imagen/Gráfico */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-3xl blur-2xl opacity-60"></div>
            
            {/* Icono */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-3xl p-16 shadow-2xl">
              <svg 
                className="h-48 w-48 text-emerald-600"
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/>
                <path d="M6.453 15h11.094"/>
                <path d="M8.5 2h7"/>
              </svg>
            </div>
          </div>
        </div>

        </div>
      </div>


      {/* Footer */}
      <div className="border-t border-slate-200 bg-white/50 backdrop-blur-sm py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-600 sm:px-6 lg:px-8">
          <p>© 2024 SysLab. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}