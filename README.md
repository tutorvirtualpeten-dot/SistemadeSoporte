# Sistema de Soporte Petén (HelpDesk)

Este es un sistema de tickets de soporte basado en el stack MERN (MongoDB, Express, React/Next.js, Node.js).

## Requisitos Previos

- **Node.js**: Instalado (v18 o superior).
- **MongoDB**: Debe estar ejecutándose localmente en el puerto 27017 (o configurar `MONGODB_URI` en `.env`).

## Instalación y Ejecución

### 1. Iniciar el Backend (Servidor)

Abre una terminal y ejecuta:

```bash
cd server
npm install # Si no lo has hecho
npm run dev
```

El servidor iniciará en **http://localhost:5000**.

### 2. Iniciar el Frontend (Cliente)

Abre **otra** terminal y ejecuta:

```bash
cd client
npm install # Si no lo has hecho
npm run dev
```

El cliente web iniciará en **http://localhost:3000**.

## Credenciales Iniciales

El sistema no tiene usuarios por defecto.
1. Ve a `http://localhost:3000/auth/register`.
2. Registra un nuevo usuario.
   - Selecciona rol "Docente" o "Administrativo" para ver el portal de usuario.
3. Para crear un **Administrador**:
   - Puedes registrar un usuario y luego cambiar manualmente su rol a `admin` en la base de datos (usando MongoDB Compass).
   - O usar la API directa si tienes postman.
   - *Nota: En producción, deberías tener un script de seed.*

## Funcionalidades

- **Portal de Usuario**: Crear tickets, ver historial, comentar.
- **Admin**: Dashboard de métricas, gestión de usuarios (técnicos), configuración global.
