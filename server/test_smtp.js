const nodemailer = require('nodemailer');

// CONFIGURACIÓN A PROBAR (Poner aquí los datos reales para probar)
const config = {
    host: 'smtp.gmail.com',
    port: 465, // Prueba con 465
    secure: true,
    user: 'soportepeten@mineduc.edu.gt',
    pass: 'grle xwtf oaet pwxr' // Clave extraída de tu captura
};

const test = async () => {
    console.log('🔄 Probando conexión a:', config.host, 'Puerto:', config.port);

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
            user: config.user,
            pass: config.pass
        },
        tls: { rejectUnauthorized: false }
    });

    try {
        await transporter.verify();
        console.log('✅ ¡Éxito! La conexión funciona correctamente.');
        console.log('Esto confirma que tu Usuario y Clave están bien.');
    } catch (error) {
        console.error('❌ Error de conexión:', error);
    }
};

test();
