import { useState } from "react";
import laboratorioImg from "../assets/laboratoriosHC.png";

function LaboratoriosHC() {
  const [labActivo, setLabActivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  //para los ocupados
  
  
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

  {/* MA6 */}
  <polygon
    points="131,88 264,88 264,268 131,268"
    onClick={() => setLabActivo("HC6")}
    className="cursor-pointer fill-transparent hover:fill-green-500/30"
  />

  {/* MA5 */}
  <polygon
    points="298,98 438,98 438,258 298,258"
    onClick={() => setLabActivo("HC5")}
    className="cursor-pointer fill-transparent hover:fill-green-500/30"
  />

  {/* MA4 */}
  <polygon
    points="563,93 688,93 688,260 563,260"
    onClick={() => setLabActivo("HC4")}
    className="cursor-pointer fill-transparent hover:fill-green-500/30"
  />

  {/* MA3 */}
  <polygon
    points="707,93 837,93 837,252 707,252"
    onClick={() => setLabActivo("HC3")}
    className="cursor-pointer fill-transparent hover:fill-green-500/30"
  />

  {/* AU1 */}
  <polygon
    points="591,450 737,450 737,607 591,607"
    onClick={() => setLabActivo("AU1")}
    className="cursor-pointer fill-transparent hover:fill-green-500/30"
  />

  {/* MA2 */}
  <polygon
    points="967,448 1095,448 1095,604 967,604"
    onClick={() => setLabActivo("HC2")}
    className="cursor-pointer fill-transparent hover:fill-green-500/30"
  />

  {/* MA1 */}
  <polygon
    points="1125,444 1254,444 1254,604 1125,604"
    onClick={() => setLabActivo("HC1")}
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

export default LaboratoriosHC;