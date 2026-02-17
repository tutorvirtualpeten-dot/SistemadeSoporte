# Prompt para Crear un Sistema de Soporte Técnico (HelpDesk)

Este documento contiene el prompt completo que puedes usar para solicitar la creación de un sistema de soporte técnico similar al Sistema de Soporte Petén.

---

## 🎯 Prompt Principal

```
Necesito que me ayudes a crear un Sistema de Mesa de Ayuda (HelpDesk) completo 
para una institución educativa. El sistema debe permitir que docentes y personal 
administrativo reporten problemas técnicos y reciban soporte de un equipo de agentes.

STACK TECNOLÓGICO REQUERIDO:
- Backend: Node.js + Express.js
- Frontend: Next.js 14+ (App Router) + React
- Base de Datos: MongoDB con Mongoose
- Autenticación: JWT (JSON Web Tokens)
- Estilos: Tailwind CSS
- Despliegue: Compatible con Vercel (serverless)

CARACTERÍSTICAS PRINCIPALES:

1. GESTIÓN DE TICKETS
   - Formulario público para crear tickets (sin necesidad de login)
   - Formulario interno para usuarios autenticados (docentes/administrativos)
   - Campos del ticket:
     * Nombre completo del solicitante
     * Email de contacto
     * Teléfono
     * Tipo de servicio (catálogo configurable)
     * Prioridad (Baja, Media, Alta, Urgente)
     * Descripción detallada del problema
     * Estado (Abierto, En Progreso, Resuelto, Cerrado)
   - Sistema de numeración automática incremental (ej: #0001, #0002)
   - Asignación de tickets a agentes específicos
   - Historial completo de cambios en cada ticket (audit trail)

2. SISTEMA DE USUARIOS Y ROLES
   - Roles: Super Admin, Admin, Agente, Docente
   - Permisos diferenciados por rol:
     * Super Admin: Control total del sistema
     * Admin: Gestión de usuarios, tickets y configuración
     * Agente: Ver y gestionar tickets asignados
     * Docente: Crear tickets y ver sus propios tickets
   - Autenticación segura con JWT
   - Hashing de contraseñas con bcrypt
   - Middleware de protección de rutas

3. PANEL DE ADMINISTRACIÓN
   - Dashboard con métricas en tiempo real:
     * Total de tickets por estado
     * Tickets por prioridad
     * Tickets por agente
     * Tendencias y estadísticas
   - Gestión de usuarios (CRUD completo)
   - Gestión de tipos de servicio
   - Configuración del sistema:
     * Nombre de la institución
     * Logo personalizable
     * Colores del tema
     * Información de contacto

4. HERRAMIENTAS DE PRODUCTIVIDAD
   - Respuestas Rápidas (Canned Responses):
     * Plantillas predefinidas para respuestas comunes
     * Categorización de plantillas
     * Inserción con un click
   - Sistema de Notificaciones Internas:
     * Notificaciones en tiempo real (usando polling cada 60 seg)
     * Icono de campana con contador de no leídas
     * Panel de notificaciones con historial
     * Notificar cuando:
       - Se crea un nuevo ticket
       - Se asigna un ticket a un agente
       - Cambia el estado de un ticket
       - Se agrega un comentario

5. AUDITORÍA Y SEGURIDAD
   - System Log (Registro del Sistema):
     * Registro de inicios de sesión
     * Cambios en configuración
     * Creación/modificación/eliminación de usuarios
     * Acciones administrativas críticas
   - Activity Log por Ticket:
     * Quién hizo qué cambio
     * Cuándo se realizó
     * Valores anteriores y nuevos
   - Protección contra accesos no autorizados
   - Validación de permisos en cada acción

6. INTERFAZ DE USUARIO
   - Diseño moderno y responsive (mobile-first)
   - Tema oscuro/claro (opcional)
   - Navegación intuitiva
   - Formularios con validación en tiempo real
   - Mensajes de éxito/error claros
   - Tablas con paginación, búsqueda y filtros
   - Modales para acciones importantes

ARQUITECTURA DEL BACKEND:

1. Estructura de carpetas:
   /server
   ├── /controllers      # Lógica de negocio
   │   ├── authController.js
   │   ├── ticketController.js
   │   ├── adminController.js
   │   ├── notificationController.js
   │   └── settingController.js
   ├── /models          # Esquemas de MongoDB
   │   ├── User.js
   │   ├── Ticket.js
   │   ├── TicketHistory.js
   │   ├── SystemLog.js
   │   ├── Notification.js
   │   ├── CannedResponse.js
   │   ├── ServiceType.js
   │   └── Counter.js
   ├── /routes          # Definición de endpoints
   ├── /middleware      # Autenticación y validación
   ├── /utils           # Funciones auxiliares
   └── index.js         # Punto de entrada

2. Modelos de datos principales:

   User:
   - nombre, email, password (hashed)
   - rol (super_admin, admin, agente, docente)
   - activo (boolean)
   - timestamps

   Ticket:
   - ticket_id (número incremental)
   - nombre_solicitante, email, telefono
   - tipo_servicio (referencia a ServiceType)
   - prioridad, estado
   - descripcion
   - asignado_a (referencia a User)
   - creado_por (referencia a User, opcional)
   - timestamps

   TicketHistory:
   - ticket_id (referencia a Ticket)
   - campo_modificado
   - valor_anterior, valor_nuevo
   - modificado_por (referencia a User)
   - timestamp

   Notification:
   - recipient_id (referencia a User)
   - tipo (nuevo_ticket, asignacion, cambio_estado, comentario)
   - mensaje
   - ticket_id (referencia a Ticket)
   - leida (boolean)
   - timestamp

   SystemLog:
   - usuario_id (referencia a User)
   - accion (login, crear_usuario, modificar_config, etc.)
   - detalles
   - ip_address
   - timestamp

3. Endpoints API principales:

   Autenticación:
   - POST /api/auth/login
   - POST /api/auth/register
   - GET /api/auth/me

   Tickets:
   - GET /api/tickets (con filtros y paginación)
   - GET /api/tickets/:id
   - POST /api/tickets (público y autenticado)
   - PUT /api/tickets/:id
   - DELETE /api/tickets/:id
   - POST /api/tickets/:id/comments
   - GET /api/tickets/:id/history

   Admin:
   - GET /api/admin/users
   - POST /api/admin/users
   - PUT /api/admin/users/:id
   - DELETE /api/admin/users/:id
   - GET /api/admin/stats
   - GET /api/admin/system-logs

   Notificaciones:
   - GET /api/notifications
   - PUT /api/notifications/:id/read
   - PUT /api/notifications/read-all

   Configuración:
   - GET /api/settings
   - PUT /api/settings

ARQUITECTURA DEL FRONTEND:

1. Estructura de carpetas:
   /client
   ├── /src
   │   ├── /app              # Next.js App Router
   │   │   ├── page.tsx      # Formulario público
   │   │   ├── /login
   │   │   ├── /admin
   │   │   │   ├── page.tsx  # Dashboard
   │   │   │   ├── /tickets
   │   │   │   ├── /users
   │   │   │   └── /settings
   │   │   └── layout.tsx
   │   ├── /components       # Componentes reutilizables
   │   │   ├── /admin
   │   │   ├── /tickets
   │   │   └── /ui
   │   ├── /context          # React Context
   │   │   ├── AuthContext.tsx
   │   │   └── NotificationContext.tsx
   │   ├── /lib              # Utilidades
   │   │   └── api.ts        # Cliente Axios configurado
   │   └── /types            # TypeScript types
   └── package.json

2. Contextos principales:

   AuthContext:
   - Estado del usuario autenticado
   - Funciones login/logout
   - Verificación de permisos
   - Persistencia en localStorage

   NotificationContext:
   - Polling cada 60 segundos
   - Estado de notificaciones no leídas
   - Funciones para marcar como leídas

3. Componentes clave:
   - AdminSidebar: Navegación del panel admin
   - TicketTable: Tabla de tickets con filtros
   - TicketForm: Formulario de creación/edición
   - NotificationBell: Campana con contador
   - StatCard: Tarjetas de métricas
   - UserManagement: CRUD de usuarios

FUNCIONALIDADES ESPECIALES:

1. Sistema de Numeración Automática:
   - Usar modelo Counter para mantener secuencia
   - Formato: #0001, #0002, etc.
   - Incremento atómico en MongoDB

2. Notificaciones sin WebSockets:
   - Implementar polling cada 60 segundos
   - Optimizar consultas con índices
   - Mostrar badge con número de no leídas

3. Historial de Cambios:
   - Registrar automáticamente cada modificación
   - Mostrar línea de tiempo en detalle del ticket
   - Incluir quién, qué y cuándo

4. Respuestas Rápidas:
   - CRUD de plantillas
   - Categorización
   - Inserción en campo de respuesta

5. Configuración Dinámica:
   - Logo subido a Cloudinary (opcional) o base64
   - Colores personalizables
   - Aplicar cambios sin reiniciar

SEGURIDAD:

1. Backend:
   - Validación de entrada en todos los endpoints
   - Sanitización de datos
   - Rate limiting (opcional)
   - CORS configurado correctamente
   - Variables de entorno para secretos

2. Frontend:
   - Validación de formularios
   - Protección de rutas (redirect si no autenticado)
   - Sanitización de HTML en comentarios
   - HTTPS en producción

DESPLIEGUE:

1. Configuración para Vercel:
   - Backend y Frontend en el mismo proyecto
   - Variables de entorno en Vercel dashboard
   - Archivo vercel.json para rutas API

2. Variables de entorno necesarias:
   - MONGODB_URI
   - JWT_SECRET
   - BREVO_API_KEY (para emails, opcional)
   - BREVO_SENDER_EMAIL
   - PORT

EXTRAS DESEABLES:

1. Sistema de comentarios en tickets
2. Exportación de reportes a Excel/PDF
3. Búsqueda avanzada con múltiples filtros
4. Etiquetas/tags para tickets
5. Archivos adjuntos (usando Cloudinary)
6. Integración con email (Brevo/Resend)
7. Control de permisos granular por módulo

ESTILO DE CÓDIGO:

- Código limpio y bien comentado
- Manejo de errores robusto
- Mensajes de error en español
- Validaciones tanto en frontend como backend
- Logging de errores importantes
- Código modular y reutilizable

Por favor, ayúdame a construir este sistema paso a paso, comenzando por la 
estructura básica y luego agregando funcionalidades incrementalmente.
```

---

## 📋 Prompt Simplificado (Versión Corta)

Si prefieres una versión más concisa:

```
Crea un sistema HelpDesk completo con:

STACK: Node.js + Express + MongoDB + Next.js 14 + Tailwind CSS

FUNCIONALIDADES:
1. Tickets: Crear (público/privado), asignar, estados, prioridades, historial
2. Usuarios: Roles (Super Admin, Admin, Agente, Docente) con JWT
3. Admin Panel: Dashboard, gestión usuarios, configuración
4. Notificaciones: Sistema de alertas internas con polling
5. Respuestas Rápidas: Plantillas predefinidas
6. Auditoría: System Log + Activity Log por ticket
7. UI: Moderna, responsive, con Tailwind CSS

MODELOS: User, Ticket, TicketHistory, Notification, SystemLog, 
CannedResponse, ServiceType, Counter

DESPLIEGUE: Compatible con Vercel (serverless)

Construye la arquitectura completa con backend API RESTful y frontend 
con Next.js App Router. Incluye autenticación, protección de rutas, 
y sistema de permisos por rol.
```

---

## 🎨 Prompt para Características Específicas

### Para Agregar Sistema de Notificaciones
```
Implementa un sistema de notificaciones internas para el HelpDesk:
- Modelo Notification con: recipient_id, tipo, mensaje, ticket_id, leida, timestamp
- Endpoint GET /api/notifications (filtrado por usuario)
- Endpoint PUT /api/notifications/:id/read
- Context en React con polling cada 60 segundos
- Componente NotificationBell con badge de contador
- Crear notificaciones cuando: nuevo ticket, asignación, cambio estado
```

### Para Agregar Respuestas Rápidas
```
Agrega funcionalidad de Respuestas Rápidas (Canned Responses):
- Modelo CannedResponse: titulo, contenido, categoria, activo
- CRUD completo en admin panel
- Componente selector de plantillas en formulario de respuesta
- Inserción con un click en textarea
- Categorización para organizar plantillas
```

### Para Agregar Auditoría
```
Implementa sistema de auditoría completo:
1. TicketHistory: Registrar cada cambio en tickets (campo, valor anterior/nuevo, usuario, fecha)
2. SystemLog: Registrar acciones críticas (login, cambios config, gestión usuarios)
3. Panel de visualización en admin con filtros por fecha, usuario, acción
4. Línea de tiempo en detalle de ticket mostrando historial
```

---

## 💡 Tips para Usar el Prompt

1. **Desarrollo Incremental**: No pidas todo a la vez. Comienza con la estructura básica y agrega funcionalidades gradualmente.

2. **Orden Recomendado**:
   - Paso 1: Estructura del proyecto + modelos básicos
   - Paso 2: Autenticación y usuarios
   - Paso 3: CRUD de tickets
   - Paso 4: Admin panel y dashboard
   - Paso 5: Notificaciones
   - Paso 6: Funcionalidades avanzadas

3. **Especifica el Idioma**: Menciona que quieres mensajes de error, comentarios y UI en español.

4. **Pide Documentación**: Solicita que se genere README.md y documentación técnica.

5. **Testing**: Pide ejemplos de cómo probar cada funcionalidad.

---

## 🔄 Prompt para Migración/Clonación

Si quieres que alguien clone este sistema exacto:

```
Necesito clonar/replicar el Sistema de Soporte Petén. Es un HelpDesk completo 
con MERN Stack. 

Revisa el código en: [URL del repositorio o carpeta]

Ayúdame a:
1. Entender la arquitectura actual
2. Documentar todas las funcionalidades
3. Crear guía de instalación
4. Configurar variables de entorno
5. Migrar a un nuevo servidor/PC
6. Personalizar para otra institución

El sistema incluye: gestión de tickets, roles de usuario, notificaciones, 
respuestas rápidas, auditoría completa, y panel de administración.
```

---

**Desarrollado para Soporte Petén**  
Por: Ing. Alex Alberto Canek Romero
