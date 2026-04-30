import { useState } from "react";
import Navbar from "../components/NavBar";
import laboratorioImg from "../assets/laboratoriosMB.png";

function LaboratoriosMB() {
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

      {/* Navbar */}
      <Navbar />

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
        {/* MB1 */}
<polygon
  points="133,116 261,116 261,280 133,280"
  onClick={() => setLabActivo("MB1")}
  className="cursor-pointer fill-transparent hover:fill-green-500/30"
/>

{/* MB2 */}
<polygon
  points="304,112 428,112 428,286 304,286"
  onClick={() => setLabActivo("MB2")}
  className="cursor-pointer fill-transparent hover:fill-green-500/30"
/>

{/* MB3 */}
<polygon
  points="563,114 685,114 685,270 563,270"
  onClick={() => setLabActivo("MB3")}
  className="cursor-pointer fill-transparent hover:fill-green-500/30"
/>

{/* MB4 */}
<polygon
  points="713,120 832,120 832,276 713,276"
  onClick={() => setLabActivo("MB4")}
  className="cursor-pointer fill-transparent hover:fill-green-500/30"
/>

{/* MB5 */}
<polygon
  points="437,438 559,438 559,612 437,612"
  onClick={() => setLabActivo("MB5")}
  className="cursor-pointer fill-transparent hover:fill-green-500/30"
/>

{/* MB6 */}
<polygon
  points="591,436 723,436 723,594 591,594"
  onClick={() => setLabActivo("MB6")}
  className="cursor-pointer fill-transparent hover:fill-green-500/30"
/>

{/* MB7 */}
<polygon
  points="864,440 974,440 974,592 864,592"
  onClick={() => setLabActivo("MB7")}
  className="cursor-pointer fill-transparent hover:fill-green-500/30"
/>

{/* MB8 */}
<polygon
  points="1002,442 1135,442 1135,600 1002,600"
  onClick={() => setLabActivo("MB8")}
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

export default LaboratoriosMB;