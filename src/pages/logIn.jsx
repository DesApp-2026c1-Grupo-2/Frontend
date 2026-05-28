import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

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

    if (!email || !password) {
      setError("Completá todos los campos");
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
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-[320px] flex flex-col gap-4"
      >

        <h2 className="text-xl font-bold text-center">
          Iniciar sesión
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm text-center">
            {error}
          </div>
        )}

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
          disabled={loading}
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
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