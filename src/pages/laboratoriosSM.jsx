import { useState } from "react";
import laboratorioImg from "../assets/laboratoriosSM.png";

function LaboratoriosSM() {
  const [labActivo, setLabActivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const labsOcupados = ["SM2", "SM5"];
  const estaOcupado = (lab) => labsOcupados.includes(lab);
  
  //aca va el back despues
  const handleReservar = (lab) => {
  console.log("Reservando laboratorio:", lab);
  setLabActivo(null);
  setMensaje("¡Laboratorio reservado con éxito!");

  //desaparece desp de 3 seg
  setTimeout(() => {
    setMensaje("");
  }, 3000);
  };

  return (
    <div className="w-full h-[calc(100vh-70px)] mt-[70px] relative bg-[#f9fbfc]">

      {/* Contenedor principal */}
      <div className="w-full h-[calc(100vh-70px)] mt-[70px] relative">

        {/* Imagen */}
        <img
          src={laboratorioImg}
          alt="Plano laboratorios"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* SVG INTERACTIVO */}
        <svg
            viewBox="0 0 1366 768"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full"
        >
        {/* SM1 */}
            <polygon
            points="140,122 266,122 266,276 140,276"
            onClick={() => setLabActivo("SM1")}
            className="cursor-pointer fill-transparent hover:fill-green-500/30"
            />

            {/* SM2 */}
            <polygon
            points="304,114 426,114 426,270 304,270"
            onClick={() => !estaOcupado("SM2")}
            className={`cursor-pointer fill-transparent ${
            estaOcupado("SM2")
                ? "hover:fill-gray-400/40"
                : "hover:fill-green-500/30"
            }`}
            />

            {/* SM3 */}
            <polygon
            points="551,120 681,120 681,270 551,270"
            onClick={() => setLabActivo("SM3")}
            className="cursor-pointer fill-transparent hover:fill-green-500/30"
            />

            {/* SM4 */}
            <polygon
            points="703,122 838,122 838,270 703,270"
            onClick={() => setLabActivo("SM4")}
            className="cursor-pointer fill-transparent hover:fill-green-500/30"
            />

            {/* SM5 */}
            <polygon
            points="430,444 567,444 567,604 430,604"
            onClick={() => setLabActivo("SM5")}
            className="cursor-pointer fill-transparent hover:fill-green-500/30"
            />

            {/* SM6 */}
            <polygon
            points="607,450 721,450 721,596 607,596"
            onClick={() => setLabActivo("SM6")}
            className="cursor-pointer fill-transparent hover:fill-green-500/30"
            />

            {/* SM7 */}
            <polygon
            points="964,452 1104,452 1104,588 964,588"
            onClick={() => setLabActivo("SM7")}
            className="cursor-pointer fill-transparent hover:fill-green-500/30"
            /> 

        </svg>

        {/* OSCURECER FONDO */}
        {labActivo && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-40" />
        )}

        {/* PANEL INFO */}
        {labActivo && (
          <div className="absolute top-1/2 left-1/2 z-50 
            translate-x-[-50%] translate-y-[-50%] 
            bg-white p-6 rounded-xl shadow-xl text-center w-[250px]">

            <h2 className="text-lg font-bold mb-2">
              Laboratorio {labActivo}
            </h2>

            <p className="text-sm">Capacidad: 30</p>
            <p className="text-sm mb-3">Tipo: Computación</p>

            <div className="flex flex-col gap-2 mt-3">

            {estaOcupado(labActivo) ? (
                <p className="text-red-500 font-semibold">
                Este laboratorio está ocupado
                </p>
            ) : (
            <button
                onClick={() => handleReservar(labActivo)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
            Reservar
            </button>
            )}

            <button
                onClick={() => setLabActivo(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold"
            >
            ×
            </button>
        </div>
    </div>
    )}

      </div>
    {mensaje && (
      <>
    {/* fondo oscuro */}
    <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-40" />

    {/* cartel */}
    <div className="absolute top-1/2 left-1/2 z-50 
      translate-x-[-50%] translate-y-[-50%] 
      bg-white px-6 py-4 rounded-xl shadow-xl text-center">

      <p className="text-green-600 font-semibold">
        {mensaje}
      </p>

    </div>
  </>
)}  
    </div>
  );
}

export default LaboratoriosSM;