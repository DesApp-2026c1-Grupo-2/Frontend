import { useState } from "react";
import laboratorioImg from "../assets/laboratoriosMA.png";

function LaboratoriosMA() {
  const [labActivo, setLabActivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  
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
        {/* LAB 1 */}
        <polygon
        points="130,110 276,110 276,288 130,288"
        onClick={() => setLabActivo("MA1")}
        className="cursor-pointer fill-transparent hover:fill-green-500/30"
        />

        {/* LAB 2 */}
        <polygon
        points="306,118 428,118 428,278 306,278"
        onClick={() => setLabActivo("MA2")}
        className="cursor-pointer fill-transparent hover:fill-green-500/30"
        />

        {/* LAB 3 */}
        <polygon
        points="567,115 679,115 679,277 567,277"
        onClick={() => setLabActivo("MA3")}
        className="cursor-pointer fill-transparent hover:fill-green-500/30"
        />

            {/* LAB 4 */}
            <polygon
            points="707,115 828,115 828,277 707,277"
            onClick={() => setLabActivo("MA4")}
            className="cursor-pointer fill-transparent hover:fill-green-500/30"
            />

        {/* LAB 5 */}
        <polygon
        points="435,458 555,458 555,608 435,608"
        onClick={() => setLabActivo("MA5")}
        className="cursor-pointer fill-transparent hover:fill-green-500/30"
        />

        {/* LAB 6 */}
        <polygon
        points="603,460 731,460 731,608 603,608"
        onClick={() => setLabActivo("MA6")}
        className="cursor-pointer fill-transparent hover:fill-green-500/30"
        />

        {/* LAB 7 */}
        <polygon
        points="978,456 1100,456 1100,616 978,616"
        onClick={() => setLabActivo("MA7")}
        className="cursor-pointer fill-transparent hover:fill-green-500/30"
        />

        {/* LAB 8 */}
        <polygon
        points="1118,452 1257,452 1257,604 1118,604"
        onClick={() => setLabActivo("MA8")}
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

  <button
    onClick={() => handleReservar(labActivo)}
    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
  >
    Reservar
  </button>

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

export default LaboratoriosMA;