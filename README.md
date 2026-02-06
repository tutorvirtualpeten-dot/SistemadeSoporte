# Sistema de Soporte Petén (HelpDesk)

Sistema integral de gestión de tickets de soporte técnico desarrollado con MERN Stack (MongoDB, Express, React, Node.js).
Diseñado para instituciones educativas, permitiendo la gestión eficiente de solicitudes de docentes y personal administrativo.

## 🚀 Características Principales

### Gestión de Tickets
- **Creación de Tickets:** Interfaz sencilla para usuarios (docentes/administrativos) y pública.
- **Asignación Automática:** Los administradores pueden asignar agentes a casos específicos.
- **Estados y Prioridades:** Flujo de trabajo claro (Abierto, En Progreso, Resuelto, Cerrado).

### Herramientas de Productividad (Nuevo 🌟)
- **Respuestas Rápidas (Canned Responses):** Plantillas predefinidas para responder preguntas frecuentes con un clic.
- **Historial de Actividad (Audit Log):** Registro detallado de cada cambio en un ticket (quién, qué y cuándo).
- **Notificaciones Internas:** Sistema de alertas (campanita) para avisar a agentes y usuarios sobre actualizaciones en tiempo real.

### Administración y Seguridad
- **Roles de Usuario:** Super Admin, Admin, Agente, Docente.
- **Auditoría del Sistema (System Log):** Panel de seguridad que registra inicios de sesión, cambios de configuración y gestión de usuarios.
- **Protección de Rutas:** Middleware de autenticación robusto basado en JWT.

## 🔮 Hoja de Ruta (Futuro)
- [ ] **Integración con WhatsApp (Two-Way):** Módulo para recibir y responder tickets directamente desde WhatsApp usando la Cloud API.
- [ ] **Reportes Avanzados:** Gráficos de rendimiento por agente y tiempos de resolución.

## 🛠 Instalación y Despliegue

### Requisitos
- Node.js v14+
- MongoDB (Atlas o Local)

### Pasos
1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. Configurar variables de entorno (`.env`).
4. Iniciar servidores:
   ```bash
   # Backend
   cd server && npm run dev
   # Frontend
   cd client && npm run dev
   ```

---
Desarrollado para Soporte Petén.
