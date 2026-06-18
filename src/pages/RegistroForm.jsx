import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FiMonitor } from "react-icons/fi";
import logo from "../assets/logo.png";

function RegistroForm() {
    const navigate = useNavigate();
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
        const payload = { ...form };
        if (!payload.legajo.trim()) {
            delete payload.legajo;
        }

        await api.post("/usuarios", payload);

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
            // Capturamos el primer detalle de Joi, o el mensaje del controlador
            const errorValidacion = err.response?.data?.detalles?.[0];
            const errorMensaje = err.response?.data?.message;

            setError(
                errorValidacion || 
                errorMensaje || 
                "Error al crear usuario"
            );
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
                onClick={() => navigate("/logIn")}
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
            Registro de
            <span className="block text-emerald-600">
                nuevo usuario
            </span>
            </h1>

            <p className="mt-6 text-lg text-slate-500 max-w-md">
            Creá tu cuenta y accedé al sistema de gestión de laboratorios.
            </p>

        </div>

        {/* FORMULARIO */}
        <div className="flex justify-center px-6 py-8 lg:py-10">

            <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg flex flex-col gap-4"
            >

            <h2 className="text-3xl font-bold text-slate-700">
                Crear cuenta
            </h2>

            <p className="text-sm text-slate-500 mb-2">
                Registrate para acceder al sistema.
            </p>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-xl text-sm">
                {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-700 px-4 py-2 rounded-xl text-sm">
                {success}
                </div>
            )}

            <input
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
                className={`border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                className={`border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                className={`border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                className={`border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                value={form.legajo}
                onChange={handleChange}
                className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
                <option value="DOCENTE">Docente</option>
                <option value="PERSONAL">Personal</option>
                <option value="ADMIN">Administrador</option>
            </select>

            <button
                type="submit"
                className="
                px-6 py-3
                rounded-xl
                text-sm
                bg-emerald-500
                text-white
                font-bold
                hover:bg-emerald-600
                transition-all
                shadow-md shadow-emerald-200
                "
            >
                Crear cuenta
            </button>

            <button
                type="button"
                onClick={() => navigate("/login")}
                className="
                text-sm
                text-emerald-600
                hover:text-emerald-700
                hover:underline
                "
            >
                Ya tengo cuenta
            </button>

            </form>

        </div>

        </div>


        </div>
    );
}

export default RegistroForm;