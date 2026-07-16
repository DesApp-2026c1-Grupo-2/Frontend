# Sistema de Gestión de Laboratorios - Frontend

> Interfaz web desarrollada con **React** y **Vite** para la administración de laboratorios de docencia de Biología y Química.

---

# Descripción

Este proyecto corresponde al **Frontend** del Trabajo Práctico **Gestión de Laboratorios de Docencia**.

La aplicación proporciona una interfaz intuitiva para que docentes y personal encargado de la gestión de laboratorios puedan administrar los recursos necesarios para el desarrollo de actividades prácticas.

El frontend consume la API REST desarrollada en el repositorio Backend y permite visualizar, crear, modificar y administrar la información del sistema mediante una experiencia de usuario moderna y dinámica.

---

# Objetivos

La aplicación busca facilitar la gestión diaria de los laboratorios universitarios permitiendo:

- Administrar laboratorios y edificios.
- Gestionar equipamiento.
- Registrar actividades.
- Administrar pedidos realizados por docentes.
- Consultar reservas.
- Visualizar el calendario de utilización.
- Gestionar usuarios.
- Consultar historiales del sistema.

---

# Tecnologías utilizadas

| Tecnología | Uso |
|------------|-----|
| React | Biblioteca principal |
| Vite | Entorno de desarrollo |
| React Router | Navegación |
| Axios | Comunicación con la API |
| ESLint | Calidad de código |
| Vitest | Testing |

---

# Requisitos

Antes de ejecutar el proyecto es necesario contar con:

- Node.js 18 o superior
- npm

Además, el Backend debe encontrarse ejecutándose correctamente.

---

# Instalación

Clonar el repositorio

```bash
git clone <url-del-repositorio>
```

Ingresar al proyecto

```bash
cd Frontend
```

Instalar dependencias

```bash
npm install
```

Iniciar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

---

# Scripts disponibles

| Script | Descripción |
|---------|-------------|
| npm run dev | Inicia el servidor de desarrollo |
| npm run build | Genera la versión de producción |
| npm run preview | Visualiza el build generado |
| npm run lint | Ejecuta ESLint |
| npm test | Ejecuta las pruebas |
| npm run test:ui | Ejecuta Vitest con interfaz |
| npm run coverage | Genera reporte de cobertura |

---

# Estructura del proyecto

```
src/
│
├── assets/
├── components/
├── context/
├── hooks/
├── pages/
├── routes/
├── services/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

La aplicación sigue una estructura modular para facilitar el mantenimiento y la escalabilidad.

---

# Pantallas implementadas


Actualmente el sistema cuenta con las siguientes vistas principales.


## Inicio de sesión

Permite autenticar usuarios registrados para acceder a la plataforma.

--- ![alt text](image.png)

## Registro

Formulario para registrar nuevos usuarios.

---

## Dashboard

Panel principal desde el cual se accede a las distintas funcionalidades del sistema.

--- ![alt text](image-1.png)

## Laboratorios

Permite visualizar y administrar los laboratorios disponibles.

Entre sus funcionalidades se encuentran:

- Alta de laboratorios.
- Modificación.
- Eliminación.
- Consulta de disponibilidad.

---

## Edificios

Administración de los edificios donde se encuentran los laboratorios.

---

## Equipamiento

Permite gestionar el equipamiento disponible para las actividades prácticas.

---

## Actividades

Administración de las actividades académicas que requieren la utilización de laboratorios.

---

## Pedidos

Visualización y administración de los pedidos realizados por docentes.

--- ![alt text](image-2.png)

## Detalle de pedido

Vista detallada de la información correspondiente a cada solicitud.

---

## Calendario

Permite visualizar la utilización de laboratorios y reservas organizadas temporalmente.

---

## Historial

Consulta del historial de operaciones realizadas dentro del sistema.

---

## Aprobación de usuarios

Pantalla destinada a la administración y aprobación de nuevos usuarios.

---

# Comunicación con el Backend

Toda la información utilizada por la aplicación es obtenida mediante la API REST desarrollada en el repositorio Backend.

Las operaciones de creación, modificación, consulta y eliminación de datos se realizan mediante solicitudes HTTP utilizando Axios.

---

# Arquitectura

La aplicación está organizada en componentes reutilizables siguiendo la arquitectura habitual de React.

```
Usuario

    │

    ▼

React

    │

    ▼

Pages

    │

    ▼

Components

    │

    ▼

Services

    │

    ▼

API REST

    │

    ▼

Backend
```

---

# Funcionalidades implementadas

El sistema permite actualmente:

- Gestión de laboratorios.
- Gestión de edificios.
- Gestión de equipamiento.
- Gestión de actividades.
- Gestión de pedidos.
- Consulta de reservas.
- Visualización del calendario.
- Registro de usuarios.
- Inicio de sesión.
- Aprobación de usuarios.
- Consulta del historial del sistema.

---

# Diseño de la aplicación

El frontend fue desarrollado siguiendo una estructura modular que favorece:

- reutilización de componentes;
- separación de responsabilidades;
- mantenimiento del código;
- escalabilidad del proyecto.

La interfaz fue diseñada para ofrecer una navegación simple y facilitar el acceso a las principales funcionalidades del sistema.

---

# Testing

El proyecto incorpora pruebas utilizando **Vitest**.

Para ejecutarlas:

```bash
npm test
```

Para visualizar la interfaz de pruebas:

```bash
npm run test:ui
```

Para obtener la cobertura:

```bash
npm run coverage
```

---

# Integración

Para el correcto funcionamiento de la aplicación es necesario ejecutar previamente el Backend.

Backend

```bash
docker-compose up --build

npm install

npm run seed

npm run dev
```

Frontend

```bash
npm install

npm run dev
```

---

# Posibles mejoras

Como evolución del proyecto podrían incorporarse funcionalidades como:

- Dashboard estadístico.
- Notificaciones en tiempo real.
- Reportes exportables.
- Visualización avanzada de reservas.
- Indicadores de utilización de laboratorios.
- Gestión de mantenimientos.
- Tema claro/oscuro.
- Internacionalización.

---

# Autores

Trabajo Práctico correspondiente a la materia **Desarrollo de Aplicaciones**.

Sistema desarrollado para la gestión de laboratorios universitarios utilizando una arquitectura Frontend–Backend basada en React, Node.js y MongoDB.