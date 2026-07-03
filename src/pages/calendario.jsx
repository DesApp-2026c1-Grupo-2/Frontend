import { PageHeader } from "../components/SharedUi";
import CalendarioGrande from "../components/calendario/CalendarioGrande";

export default function Calendario() {
  return (
    <div className="min-h-screen w-full bg-slate-100 px-6 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Calendario"
          preTitle=""
        />
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">

        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">
            Reservas hoy
          </p>

          <p className="text-3xl font-bold text-slate-800">
            12
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">
            Laboratorios ocupados
          </p>

          <p className="text-3xl font-bold text-slate-800">
            8
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">
            Reservas esta semana
          </p>

          <p className="text-3xl font-bold text-slate-800">
            34
          </p>
        </div>

      </div>

      {/* CONTENEDOR */}
      <div className="relative">

        {/* SOMBRA VERDE */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-30 rounded-[2rem]" />

        {/* CARD */}
        <div
          className="
            relative z-10
            bg-white/80
            backdrop-blur-sm
            border border-slate-100
            rounded-[2.5rem]
            shadow-lg
            p-8
          "
        >

          {/* TECHO */}
          <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700" />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

            {/* PANEL IZQUIERDO */}
            <div className="xl:col-span-3">

              <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-6">
                <CalendarioGrande />
              </div>

            </div>

            {/* PANEL DERECHO */}
            <div className="space-y-5">

              {/* MINI CALENDARIO */}

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

                <h3 className="font-semibold text-slate-800 mb-4">
                  Junio 2026
                </h3>

                <div className="h-[260px] rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center">

                  Mini calendario

                </div>

              </div>

              {/* RESUMEN */}

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

                <h3 className="font-semibold text-slate-800 mb-4">
                  Resumen
                </h3>

                <div className="space-y-3 text-sm text-slate-600">

                  <p>• 12 reservas hoy</p>

                  <p>• 8 laboratorios ocupados</p>

                  <p>• 3 próximas reservas</p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}