require('dotenv').config();
const { Resend } = require('resend');

/**
 * Script para probar si la API key de Resend es válida
 */
async function testResendAPI() {
    console.log('🔍 Verificando configuración de Resend...\n');

    // Verificar variables de entorno
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const recipientEmail = process.env.RESEND_RECIPIENT_EMAIL;

    console.log('📋 Configuración actual:');
    console.log(`   RESEND_API_KEY: ${apiKey ? apiKey.substring(0, 10) + '...' : '❌ NO CONFIGURADA'}`);
    console.log(`   RESEND_FROM_EMAIL: ${fromEmail || '❌ NO CONFIGURADA'}`);
    console.log(`   RESEND_RECIPIENT_EMAIL: ${recipientEmail || '❌ NO CONFIGURADA'}`);
    console.log('');

    if (!apiKey) {
        console.error('❌ ERROR: RESEND_API_KEY no está configurada');
        return;
    }

    // Probar la API
    try {
        console.log('📧 Intentando enviar email de prueba...\n');

        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
            from: fromEmail || 'onboarding@resend.dev',
            to: ['delivered@resend.dev'], // Email de prueba de Resend
            subject: 'Prueba de API - Sistema Soporte Petén',
            html: '<p>Este es un email de prueba para verificar que la API funciona.</p>'
        });

        if (error) {
            console.error('❌ ERROR DE RESEND:');
            console.error(JSON.stringify(error, null, 2));
            console.log('\n📝 Posibles causas:');
            console.log('   1. La API Key no es válida o expiró');
            console.log('   2. Has excedido el límite del plan gratuito (100 emails/día)');
            console.log('   3. El dominio del remitente no está verificado');
            console.log('   4. Problemas de conexión a internet\n');
            return;
        }

        console.log('✅ ¡Email de prueba enviado exitosamente!');
        console.log(`📬 ID del mensaje: ${data.id}`);
        console.log('\n✨ La API de Resend está funcionando correctamente.');
        console.log('   El problema puede estar en:');
        console.log('   - Los emails de los agentes no están verificados');
        console.log('   - Los emails están llegando a spam');
        console.log('   - El código no se está ejecutando correctamente\n');

    } catch (error) {
        console.error('❌ ERROR AL CONECTAR CON RESEND:');
        console.error(error.message);
        console.log('\n📝 Verifica:');
        console.log('   1. Conexión a internet');
        console.log('   2. Que el paquete "resend" esté instalado');
        console.log('   3. Que la API key sea correcta\n');
    }
}

testResendAPI();
