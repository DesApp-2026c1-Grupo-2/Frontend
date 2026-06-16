import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

import { FiMonitor, FiMail, FiLock } from "react-icons/fi";
import logo from "../assets/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email && !password) {
      setError("Completá el correo electrónico y la contraseña");
      return;
    }

    if (!email) {
      setError("El correo electrónico es obligatorio");
      return;
    }

    if (!password) {
      setError("La contraseña es obligatoria");
      return;
    }

    try {
      setLoading(true);
      
      // Realizamos el POST mediante la instancia configurada de Axios
      const response = await api.post("/usuarios/login", { email, password });
      const data = response.data;

      // Guardamos al usuario de forma global a través del Contexto
      login(data.usuario, data.token);
      
      // Redirigir de manera segura a la ruta principal / protegida
      navigate("/");
    } catch (err) {
      // Axios encapsula la respuesta de error del servidor en err.response.data
      setError(err.response?.data?.message || err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* CABECERA */}
              <div className="border-b border-slate-200 bg-white">
                  <div className="w-full px-8 lg:px-20 py-4 flex items-center justify-between">
      
                      <img
                      src={logo}
                      alt="Universidad Nacional de Hurlingham"
                      className="h-[42px] w-auto object-contain"
                      />
      
                      <button
                      onClick={() => navigate("/")}
                      className="
                          text-sm
                          text-emerald-600
                          hover:text-emerald-700
                          hover:underline
                          "
                      >
                      ← Volver
                      </button>
      
                  </div>
              </div>

      {/* CONTENIDO */}
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-75px)]">

        {/* PANEL IZQUIERDO */}
        <div className="hidden lg:flex flex-col justify-center px-20 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border-r border-slate-200">
          <FiMonitor className="text-emerald-600 mb-6" size={50} />

          <h1 className="text-5xl font-bold text-slate-800">
            Gestión de
            <span className="block text-emerald-600">
              Laboratorios
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-500 max-w-md">
            Sistema para la administración de equipamiento y reservas académicas.
          </p>
        </div>

        {/* LOGIN */}
        <div className="flex items-center justify-center px-6">

          <form
            onSubmit={handleLogin}
            className="w-full max-w-md flex flex-col gap-4"
          >
            <h2 className="text-3xl font-bold text-slate-700">
              Iniciar sesión
            </h2>

            <p className="text-sm text-slate-500 mb-2">
              Accedé con tu cuenta para continuar.
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <FiMail className="text-slate-500 text-lg" />

              <input
                type="email"
                placeholder="Correo electrónico"
                className="
                  flex-1
                  border border-slate-300
                  rounded-xl
                  px-4 py-3
                  text-slate-900
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500
                "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <FiLock className="text-slate-500 text-lg" />

              <input
                type="password"
                placeholder="Contraseña"
                className="
                  flex-1
                  border border-slate-300
                  rounded-xl
                  px-4 py-3
                  text-slate-900
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                ml-8
                px-6 py-3
                rounded-xl
                text-sm
                bg-emerald-500
                text-white
                font-bold
                hover:bg-emerald-600
                transition-all
                shadow-md shadow-emerald-200
                disabled:opacity-50
              "
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/registro")}
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              ¿No tenés cuenta? Registrarse
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;