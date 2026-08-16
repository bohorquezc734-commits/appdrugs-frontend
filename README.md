### 🎨 2. README para el Frontend (`appdrugs-frontend/README.md`)

```markdown
# 🏥 AppDrugs — Frontend Web Platform

Plataforma web SPA para la gestión de solicitudes, turnos y entrega de medicamentos en sedes farmacéuticas. Diseñada para ofrecer una experiencia fluida e intuitiva basada en **React 19**, **TypeScript** y **Tailwind CSS**.

---

## ⚡ Stack Tecnológico

- **Core:** React 19, TypeScript, React Router v7
- **Estado Global:** Zustand
- **Sincronización de Datos & Cache:** TanStack Query (React Query v5)
- **Estilos & UI:** Tailwind CSS, Headless UI, React Icons, Lottie Animations
- **Formularios:** React Hook Form + Validaciones
- **Comunicación HTTP:** Axios con Interceptores para Auto-Refresh Token
- **Tiempo Real:** SignalR (`@microsoft/signalr`)
- **Herramientas de QR:** `html5-qrcode` (Lector vía cámara) y `react-qr-code` (Generador)
- **Visualización:** Recharts (Gráficos interactivos)

---

## 👥 Vistas y Roles del Sistema

- 🔴 **Administrador:** Panel con 9 módulos completos (Overview con KPIs, Usuarios, Medicamentos, Sedes, Inventario Global, Turnos, Reportes PDF/Excel, Auditoría con Data Grid paginada y Configuración).
- 🟡 **Farmacéutico:** Control de stock por sede, recepción de turnos, escáner de recetas y confirmación de entrega por código QR.
- 🟢 **Paciente / Usuario:** Consulta de catálogo de medicamentos, creación de turnos con adjunto de recetas y seguimiento de estado en tiempo real.
- 🤖 **Drugi (Asistente IA):** Chatbot integrado para consultas de stock, precios y estado de solicitudes en lenguaje natural.

---

## 📁 Estructura del Proyecto

```text
src/
├── components/         # Componentes UI organizados por rol (Admin, Pharmacist, User, Common)
├── hooks/              # Hooks personalizados (Paginación, Auth, Debounce)
├── pages/              # Páginas de autenticación y dashboards principales
├── services/           # Cliente Axios, endpoints y servicios de API
├── store/              # Stores globales con Zustand (Auth, UI)
└── types/              # Definciones de interfaces y tipos en TypeScript
🛠️ Instalación y Configuración Local
Prerrequisitos
Node.js (v18 o superior)

npm / yarn / pnpm

Pasos
Clona el repositorio:

Bash
git clone [https://github.com/bohorquezc734-commits/appdrugs-frontend.git](https://github.com/bohorquezc734-commits/appdrugs-frontend.git)
cd appdrugs-frontend
Instala las dependencias:

Bash
npm install
Crea un archivo .env.local en la raíz del proyecto:

Fragmento de código
PORT=3000
HOST=0.0.0.0
REACT_APP_API_URL=http://localhost:5071/api
REACT_APP_PUBLIC_URL=http://localhost:3000
Inicia el servidor de desarrollo:

Bash
npm start
La aplicación se abrirá en http://localhost:3000.

📦 Scripts Disponibles
npm start: Inicia el entorno de desarrollo.

npm run build: Compila la aplicación optimizada para producción en la carpeta build/.

npm test: Ejecuta la suite de pruebas configurada.
