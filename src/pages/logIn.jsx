import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Completá todos los campos");
      return;
    }

    // login simulado (después se conecta al back)
    console.log("Login:", { email, password });

    navigate("/dashboard");
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-[320px] flex flex-col gap-4"
      >

        <h2 className="text-xl font-bold text-center">
          Iniciar sesión
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Correo electrónico"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* BOTÓN LOGIN */}
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Ingresar
        </button>

        {/* registrar pero no funciona */}
        <button
          type="button"
          onClick={() => alert("Registro aún no disponible")}
          className="text-sm text-green-600 hover:underline"
        >
          ¿No tenés cuenta? Registrarse
        </button>

      </form>

    </div>
  );
}

export default Login;