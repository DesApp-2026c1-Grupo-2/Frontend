# Frontend

Frontend desarrollado con React, Vite y Tailwind CSS.

## Tecnologías

- **React 18** — Librería de UI basada en componentes
- **Vite** — Bundler ultrarrápido para desarrollo y producción
- **Tailwind CSS** — Framework de estilos utility-first
- **PostCSS** — Procesamiento de CSS
- **ESLint** — Linting y calidad de código

## Estructura del Proyecto

```
├── public/               # Archivos estáticos (íconos, imágenes, etc.)
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── pages/            # Vistas principales de la aplicación
│   ├── hooks/            # Custom hooks
│   ├── services/         # Llamadas a APIs externas
│   ├── utils/            # Funciones utilitarias
│   ├── assets/           # Recursos estáticos (imágenes, fuentes)
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── eslint.config.js
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Instalación

### Prerrequisitos

- Node.js 18+
- npm 

### Pasos

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd <nombre-del-proyecto>
```

2. Instalar dependencias:

```bash
npm install
```

5. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Scripts Disponibles

| Comando           | Descripción                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo con HMR     |
| `npm run build`   | Genera el build optimizado para producción   |
| `npm run preview` | Previsualiza el build de producción en local |
| `npm run lint`    | Ejecuta ESLint sobre el código fuente        |