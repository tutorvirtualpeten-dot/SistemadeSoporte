require('dotenv').config();

console.log('\n🔍 DIAGNÓSTICO DE VARIABLES DE ENTORNO\n');
console.log('='.repeat(60));

// Verificar todas las variables de Brevo
const vars = {
    'BREVO_API_KEY': process.env.BREVO_API_KEY,
    'BREVO_FROM_EMAIL': process.env.BREVO_FROM_EMAIL,
    'BREVO_FROM_NAME': process.env.BREVO_FROM_NAME,
    'BREVO_RECIPIENT_EMAIL': process.env.BREVO_RECIPIENT_EMAIL
};

console.log('\n📋 Variables de Brevo:');
console.log('-'.repeat(60));

let allConfigured = true;

for (const [key, value] of Object.entries(vars)) {
    if (value) {
        if (key === 'BREVO_API_KEY') {
            console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
        } else {
            console.log(`✅ ${key}: ${value}`);
        }
    } else {
        console.log(`❌ ${key}: NO CONFIGURADA`);
        allConfigured = false;
    }
}

console.log('\n' + '='.repeat(60));

if (allConfigured) {
    console.log('✅ Todas las variables están configuradas correctamente');
} else {
    console.log('❌ FALTAN VARIABLES - Verifica tu archivo .env o Vercel');
}

console.log('\n');
