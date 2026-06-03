import { useState } from "react";
import api from "../api/axios";

function RegistroForm({ onVolverLogin }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    legajo: "",
    rol: "DOCENTE",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errores, setErrores] = useState({});

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) {
        nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!form.apellido.trim()) {
        nuevosErrores.apellido = "El apellido es obligatorio";
    }

    if (!form.email.trim()) {
        nuevosErrores.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        nuevosErrores.email = "Ingresá un email válido";
    }

    if (!form.password.trim()) {
        nuevosErrores.password = "La contraseña es obligatoria";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
    };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
        ...form,
        [name]: value,
    });

    setErrores((prev) => ({
        ...prev,
        [name]: "",
    }));
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    setError("");
    setSuccess("");

    try {
      await api.post("/usuarios", form);

      setSuccess("Usuario creado correctamente");

        setForm({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        legajo: "",
        rol: "DOCENTE",
        });

        setErrores({});

    } catch (err) {
        setError(
        err.response?.data?.message ||
        "Error al crear usuario"
        );
    }
    };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl shadow-md w-[350px] flex flex-col gap-3"
    >
      <h2 className="text-xl font-bold text-center">
        Crear cuenta
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-2 rounded text-sm">
          {success}
        </div>
      )}

      <input
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
        className={`border p-2 rounded ${
            errores.nombre ? "border-red-500" : ""
        }`}
      />

      {errores.nombre && (
        <p className="text-red-500 text-xs">
            {errores.nombre}
        </p>
        )}

      <input
        name="apellido"
        placeholder="Apellido"
        value={form.apellido}
        onChange={handleChange}
        className={`border p-2 rounded ${
            errores.apellido ? "border-red-500" : ""
        }`}
      />

      {errores.apellido && (
        <p className="text-red-500 text-xs">
          {errores.apellido}
        </p>
      )}

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className={`border p-2 rounded ${
            errores.email ? "border-red-500" : ""
        }`}
      />

      {errores.email && (
        <p className="text-red-500 text-xs">
          {errores.email}
        </p>
      )}

      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
        className={`border p-2 rounded ${
            errores.password ? "border-red-500" : ""
        }`}
      />

      {errores.password && (
        <p className="text-red-500 text-xs">
          {errores.password}
        </p>
      )}

      <input
        name="legajo"
        placeholder="Legajo (opcional)"
        className={`border p-2 rounded ${
            errores.legajo ? "border-red-500" : ""
        }`}
        value={form.legajo}
        onChange={handleChange}
      />

      <select
        name="rol"
        value={form.rol}
        onChange={handleChange}
        className={`border p-2 rounded ${
            errores.rol ? "border-red-500" : ""
        }`}
      >
        <option value="DOCENTE">Docente</option>
        <option value="PERSONAL">Personal</option>
        <option value="ADMIN">Administrador</option>
      </select>

      <button
        type="submit"
        className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Crear cuenta
      </button>

      <button
        type="button"
        onClick={onVolverLogin}
        className="text-green-600 text-sm hover:underline"
      >
        Ya tengo cuenta
      </button>
    </form>
  );
}

export default RegistroForm;