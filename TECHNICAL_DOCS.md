# Documentación Técnica - Soporte Petén

## 1. Visión General
Sistema de Mesa de Ayuda (HelpDesk) basado en arquitectura **MERN** (MongoDB, Express, React, Node.js).
Diseñado para ser desplegado en entornos serverless como **Vercel** (Frontend y Backend) o tradicionales.

## 2. Arquitectura del Sistema

### Backend (Server)
*   **Framework:** Express.js
*   **Base de Datos:** MongoDB (Mongoose ORM)
*   **Autenticación:** JWT (JSON Web Tokens)
*   **Patrón:** MVC (Model-View-Controller) simplificado.

**Estructura de Carpetas:**
*   `/controllers`: Lógica de negocio (Ticket, Auth, Admin).
*   `/models`: Esquemas de datos (MongoDB).
*   `/routes`: Definición de endpoints API.
*   `/utils`: Funciones auxiliares (Logger, Email, Notificaciones).
*   `/middleware`: Protección de rutas (`authMiddleware`).

### Frontend (Client)
*   **Framework:** Next.js 14+ (App Router)
*   **Estilos:** Tailwind CSS
*   **Estado:** React Context API (`AuthContext`, `NotificationContext`).
*   **HTTP Client:** Axios (configurado en `lib/api.ts`).

## 3. Flujos de Datos Clave

### A. Creación de Ticket
1.  **Frontend:** Usuario llena formulario -> `POST /api/tickets`.
2.  **Backend:**
    *   Valida datos.
    *   Crea registro en MongoDB (`Ticket`).
    *   Asigna ID incremental (`Counter`).
    *   **Trigger:** Notifica a Admins (`Notification`).
    *   **Trigger:** Registra actividad (`ActivityLog`).

### B. Notificaciones en Tiempo Real (Polling)
Para evitar WebSockets complejos en Vercel, usamos "Short Polling".
1.  **Frontend (`NotificationContext`):**
    *   Cada 60 segundos llama a `GET /api/notifications`.
    *   Actualiza el estado global `unreadCount`.
2.  **Backend:** Devuelve lista de notificaciones no leídas filtradas por `recipient_id`.

## 4. Modelos de Datos Principales

| Modelo | Descripción |
| :--- | :--- |
| `User` | Usuarios del sistema (Agentes, Admins). |
| `Ticket` | Núcleo del sistema. Contiene estado, prioridad y asignación. |
| `TicketHistory` | Auditoría de cambios línea por línea de un ticket. |
| `SystemLog` | Auditoría de seguridad (Login, cambios de configuración). |
| `Notification` | Alertas efímeras para usuarios. |

## 5. Seguridad
*   **Passwords:** Hashed con `bcryptjs`.
*   **API:** Protegida con `authMiddleware` que verifica el header `Authorization: Bearer <token>`.
*   **Roles:** Validación estricta en controladores (ej. solo Admin puede borrar usuarios).

---
*Generado automáticamente por Antigravity Assistant - 2026*
