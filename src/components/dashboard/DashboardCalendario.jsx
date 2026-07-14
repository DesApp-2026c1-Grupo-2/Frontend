import { FiCalendar, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

import CalendarioDia from "../calendario/calendarioDia";
import BarraFiltros from "../calendario/BarraFiltros";

import {
  getReservasActivas,
  getReservasFinalizadas,
} from "../../services/reservas";

import { obtenerEdificios } from "../../services/edificioService";
import { obtenerLaboratoriosPorEdificio } from "../../services/laboratorioService";

function agruparReservasPorHorario(reservas) {
  const grupos = {};

  reservas.forEach((reserva) => {
    const key = [
      reserva.preparacionInicio,
      reserva.reservaInicio,
      reserva.reservaFin,
      reserva.mantenimientoFin,
    ].join("|");

    if (!grupos[key]) {
      grupos[key] = {
        id: key,

        start: new Date(reserva.preparacionInicio),
        end: new Date(reserva.mantenimientoFin),

        preparacionInicio: reserva.preparacionInicio,
        reservaInicio: reserva.reservaInicio,
        reservaFin: reserva.reservaFin,
        mantenimientoFin: reserva.mantenimientoFin,

        reservas: [],
      };
    }

    grupos[key].reservas.push({
      ...reserva,
    });
  });

  return Object.values(grupos).map((grupo) => ({
    id: grupo.id,
    title: `${grupo.reservas.length} reserva(s)`,

    start: grupo.start,
    end: grupo.end,

    extendedProps: grupo,
  }));
}

export default function DashboardCalendario() {
    const navigate = useNavigate();

    const { user } = useAuth();
    
    const [reservas, setReservas] = useState([]);

    const [edificio, setEdificio] = useState("");
    const [laboratorio, setLaboratorio] = useState("todos");

    const [edificios, setEdificios] = useState([]);
    const [laboratorios, setLaboratorios] = useState([]);

    useEffect(() => {
        const cargarReservas = async () => {
            try {
            const startDate = "2026-01-01";
            const endDate = "2026-12-31";

            const [activas, finalizadas] = await Promise.all([
                getReservasActivas(startDate, endDate),
                getReservasFinalizadas(startDate, endDate),
            ]);

            const todasLasReservas = [...activas, ...finalizadas];

            const reservasAdaptadas = todasLasReservas.map((r) => {
                const inicioClase = new Date(r.fechaHora);

                const finClase = new Date(
                inicioClase.getTime() + r.duracionClase * 60000
                );

                const inicioPreparacion = r.fechaInicioReal
                ? new Date(r.fechaInicioReal)
                : new Date(inicioClase.getTime() - 60 * 60000);

                const finMantenimiento = r.fechaFinReal
                ? new Date(r.fechaFinReal)
                : new Date(finClase.getTime() + 30 * 60000);

                return {
                id: r._id || r.id,

                laboratorio: r.laboratorioId.nombre,
                laboratorioId: r.laboratorioId._id || r.laboratorioId.id,

                materia: r.pedidoId.materia,

                profesor: `${r.docenteId.nombre} ${r.docenteId.apellido}`,

                docenteId: r.docenteId._id,

                preparacionInicio: inicioPreparacion.toISOString(),
                reservaInicio: inicioClase.toISOString(),
                reservaFin: finClase.toISOString(),
                mantenimientoFin: finMantenimiento.toISOString(),

                estado: r.estado,
                };
            });

            setReservas(reservasAdaptadas);
            } catch (error) {
            console.error(error);
            }
        };

        cargarReservas();
        }, []);

    useEffect(() => {
    const cargarEdificios = async () => {
        try {
        const data = await obtenerEdificios();

        setEdificios(data);

        if (data.length > 0) {
            setEdificio(data[0].id || data[0]._id);
        }
        } catch (err) {
        console.error(err);
        }
    };

    cargarEdificios();
    }, []);

    useEffect(() => {
        if (!edificio) return;

        const cargarLaboratorios = async () => {
            try {
            const data = await obtenerLaboratoriosPorEdificio(edificio);

            setLaboratorios(data);

            setLaboratorio("todos");
            } catch (err) {
            console.error(err);
            }
        };

        cargarLaboratorios();
        }, [edificio]);
        
    const esAdminOPersonal =
        user?.rol === "ADMIN" ||
        user?.rol === "PERSONAL";
        
    const reservasVisibles = esAdminOPersonal
        ? reservas
        : reservas.filter(
            (r) => r.docenteId === user._id
        );

    const idsLaboratorios = laboratorios.map(
        (l) => l._id || l.id
    );

    const reservasFiltradas = reservasVisibles.filter((r) => {
        if (laboratorio === "todos") {
            return idsLaboratorios.includes(r.laboratorioId);
        }

    return r.laboratorioId === laboratorio;
    });

    const hoy = new Date();

    const reservasHoy = reservasFiltradas.filter((r) => {
    const fechaReserva = new Date(r.reservaInicio);

    return (
        fechaReserva.getFullYear() === hoy.getFullYear() &&
        fechaReserva.getMonth() === hoy.getMonth() &&
        fechaReserva.getDate() === hoy.getDate()
    );
    });

    console.log("Edificio:", edificio);
    console.log("Laboratorios:", laboratorios.map(l => l.nombre));
    console.table(
    reservasHoy.map((r) => ({
        laboratorio: r.laboratorio,
        materia: r.materia,
        inicio: r.reservaInicio,
        estado: r.estado,
    }))
    );
    const bloques = agruparReservasPorHorario(reservasHoy);


  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <FiCalendar
              size={22}
              className="text-emerald-700"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Reservas de hoy
            </h2>

            <p className="text-sm text-slate-500">
              Estado actual de los laboratorios.
            </p>
          </div>

        </div>

        <button
          onClick={() => navigate("/calendario")}
          className="
            flex items-center gap-2
            text-sm
            font-medium
            text-emerald-700
            hover:text-emerald-800
            transition
          "
        >
          Ver calendario

          <FiArrowRight />
        </button>

      </div>

      {/* Calendario */}

      <div className="p-6">

        <BarraFiltros
            edificio={edificio}
            setEdificio={setEdificio}
            laboratorio={laboratorio}
            setLaboratorio={setLaboratorio}
            edificios={edificios}
            laboratorios={laboratorios}
            vistaActual="dayGridMonth"
        />

         <div className="mt-6">
            <CalendarioDia bloques={bloques} />
         </div>

      </div>

    </div>
  );
}