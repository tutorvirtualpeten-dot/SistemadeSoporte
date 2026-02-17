# Guía de Migración - Sistema de Soporte Petén

Esta guía te ayudará a migrar el Sistema de Soporte Petén a otro PC de manera completa y funcional.

---

## 📋 Requisitos Previos en el Nuevo PC

### Software Necesario
1. **Node.js** (v14 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version` y `npm --version`

2. **Git** (opcional, pero recomendado)
   - Descargar desde: https://git-scm.com/
   - Verificar instalación: `git --version`

3. **Editor de Código** (opcional)
   - Visual Studio Code: https://code.visualstudio.com/

---

## 🚀 Métodos de Migración

### **Método 1: Usando Git (Recomendado)**

#### Paso 1: Clonar el Repositorio
```bash
# Abrir PowerShell o CMD en la carpeta donde quieres el proyecto
git clone https://github.com/TU_USUARIO/SoportePeten.git
cd SoportePeten
```

#### Paso 2: Instalar Dependencias
```bash
# Instalar dependencias del backend
cd server
npm install

# Instalar dependencias del frontend
cd ../client
npm install
```

#### Paso 3: Configurar Variables de Entorno
```bash
# Volver a la raíz del proyecto
cd ..

# Copiar el archivo .env (ver sección de configuración abajo)
```

---

### **Método 2: Copia Manual de Archivos**

#### Paso 1: Copiar la Carpeta del Proyecto
1. En el PC original, copia toda la carpeta `SoportePeten`
2. Pégala en el nuevo PC (ejemplo: `C:\Users\NUEVO_USUARIO\Documents\PROYECTOS\SoportePeten`)

#### Paso 2: Limpiar Dependencias Antiguas
```bash
# Abrir PowerShell en la carpeta del proyecto
cd C:\Users\NUEVO_USUARIO\Documents\PROYECTOS\SoportePeten

# Eliminar carpetas node_modules antiguas
Remove-Item -Recurse -Force .\server\node_modules
Remove-Item -Recurse -Force .\client\node_modules

# Eliminar archivos de bloqueo (opcional)
Remove-Item .\server\package-lock.json
Remove-Item .\client\package-lock.json
```

#### Paso 3: Reinstalar Dependencias
```bash
# Instalar dependencias del backend
cd server
npm install

# Instalar dependencias del frontend
cd ../client
npm install
```

---

## ⚙️ Configuración de Variables de Entorno

### Archivo `.env` en la Raíz del Proyecto

Crea o edita el archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# MongoDB
MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/soportepeten?retryWrites=true&w=majority

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui

# Brevo (Email)
BREVO_API_KEY=tu_api_key_de_brevo
BREVO_SENDER_EMAIL=soportepeten@mineduc.edu.gt
BREVO_SENDER_NAME=Soporte Petén

# Puerto del servidor (opcional)
PORT=5000
```

### Obtener las Credenciales

#### MongoDB URI
1. Si usas **MongoDB Atlas**:
   - Ve a https://cloud.mongodb.com/
   - Inicia sesión con tu cuenta
   - Selecciona tu cluster
   - Click en "Connect" → "Connect your application"
   - Copia la cadena de conexión y reemplaza `<password>` con tu contraseña

2. Si usas **MongoDB Local**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/soportepeten
   ```

#### Brevo API Key
1. Ve a https://app.brevo.com/
2. Inicia sesión
3. Ve a "Settings" → "SMTP & API" → "API Keys"
4. Copia tu API key existente o crea una nueva

#### JWT Secret
- Puedes usar el mismo del PC anterior o generar uno nuevo:
```bash
# En PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

## 🗄️ Migración de Base de Datos (Opcional)

Si quieres migrar los datos existentes:

### Opción A: Usar la Misma Base de Datos
- Simplemente usa el mismo `MONGODB_URI` en el nuevo PC
- Los datos se compartirán entre ambos PCs

### Opción B: Exportar e Importar Datos
```bash
# En el PC original - Exportar
mongodump --uri="TU_MONGODB_URI" --out=./backup

# Copiar la carpeta 'backup' al nuevo PC

# En el nuevo PC - Importar
mongorestore --uri="TU_MONGODB_URI" ./backup
```

---

## ▶️ Iniciar el Sistema

### Opción 1: Usar el Script Automático
```bash
# Doble click en:
iniciar_sistema.bat
```

### Opción 2: Iniciar Manualmente

#### Terminal 1 - Backend
```bash
cd C:\Users\NUEVO_USUARIO\Documents\PROYECTOS\SoportePeten\server
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd C:\Users\NUEVO_USUARIO\Documents\PROYECTOS\SoportePeten\client
npm run dev
```

### Acceder al Sistema
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## ✅ Verificación de la Migración

### Checklist de Verificación
- [ ] Node.js instalado correctamente
- [ ] Dependencias instaladas sin errores
- [ ] Archivo `.env` configurado correctamente
- [ ] Backend inicia sin errores (puerto 5000)
- [ ] Frontend inicia sin errores (puerto 3000)
- [ ] Puedes acceder a http://localhost:3000
- [ ] Puedes iniciar sesión con tus credenciales
- [ ] Los tickets se muestran correctamente

### Solución de Problemas Comunes

#### Error: "Cannot find module"
```bash
# Reinstalar dependencias
cd server
npm install
cd ../client
npm install
```

#### Error: "Port already in use"
```bash
# Cambiar el puerto en .env
PORT=5001
```

#### Error de conexión a MongoDB
- Verifica que el `MONGODB_URI` sea correcto
- Asegúrate de que tu IP esté en la lista blanca de MongoDB Atlas
- Verifica tu conexión a internet

#### Error: "JWT malformed"
- Asegúrate de que el `JWT_SECRET` sea el mismo que en el PC original
- O cierra sesión y vuelve a iniciar sesión

---

## 📦 Crear un Paquete Portable (Opcional)

Si quieres crear un paquete completo para migrar:

```bash
# En el PC original
# 1. Comprimir la carpeta del proyecto (sin node_modules)
# 2. Incluir un archivo INSTRUCCIONES.txt con:
#    - Requisitos de software
#    - Pasos de instalación
#    - Credenciales necesarias
```

---

## 🔐 Seguridad

> [!WARNING]
> **NUNCA** compartas tu archivo `.env` públicamente o lo subas a Git.
> Contiene información sensible como contraseñas y API keys.

### Buenas Prácticas
- Mantén una copia de seguridad del archivo `.env`
- Usa diferentes `JWT_SECRET` para desarrollo y producción
- Cambia las contraseñas periódicamente

---

## 📞 Soporte

Si encuentras problemas durante la migración:
1. Revisa los logs de error en la consola
2. Verifica que todas las dependencias estén instaladas
3. Consulta la documentación técnica: `TECHNICAL_DOCS.md`

---

**Desarrollado para Soporte Petén**  
Por: Ing. Alex Alberto Canek Romero
