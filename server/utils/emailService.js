/**
 * Servicio de Email usando Brevo (Sendinblue)
 * Reemplaza a Resend para evitar restricciones de verificación de destinatarios
 */

const brevo = require('@getbrevo/brevo');

/**
 * Función genérica para enviar emails usando Brevo
 * @param {Object} params - Parámetros del email
 * @param {string|string[]} params.to - Destinatario(s)
 * @param {string} params.subject - Asunto del email
 * @param {string} params.text - Texto plano (fallback)
 * @param {string} params.html - Contenido HTML
 * @returns {Promise<boolean>} - true si se envió exitosamente
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        // 1. Verificar que existe la API key
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ BREVO_API_KEY no configurada. No se envió el correo.');
            return false;
        }

        // 2. Configurar cliente de Brevo
        const apiInstance = new brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

        // 3. Configurar remitente
        const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@example.com';
        const fromName = process.env.BREVO_FROM_NAME || 'Sistema de Soporte';

        // 4. Preparar destinatarios
        const recipients = Array.isArray(to)
            ? to.map(email => ({ email }))
            : [{ email: to }];

        // 5. Crear objeto de email
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.sender = { email: fromEmail, name: fromName };
        sendSmtpEmail.to = recipients;
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html || `<p>${text}</p>`;
        if (text && !html) {
            sendSmtpEmail.textContent = text;
        }

        // 6. Enviar correo
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log('✅ Correo enviado via Brevo:', data.messageId);
        return true;

    } catch (error) {
        console.error('❌ Error enviando correo con Brevo:', error.message);
        if (error.response) {
            console.error('Detalles del error:', error.response.body);
        }
        return false; // No lanzar error para evitar bloquear el flujo principal
    }
};

/**
 * Plantillas HTML para notificaciones de tickets
 */
const emailTemplates = {
    TICKET_CREATED: (ticket) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .ticket-info { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
                .label { font-weight: bold; color: #667eea; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                .badge-alta { background: #fee; color: #c00; }
                .badge-media { background: #ffeaa7; color: #d63031; }
                .badge-baja { background: #dfe6e9; color: #2d3436; }
                .badge-critica { background: #d63031; color: white; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Ticket Creado Exitosamente</h1>
                </div>
                <div class="content">
                    <p>Se ha creado un nuevo ticket en el Sistema de Soporte Petén.</p>
                    
                    <div class="ticket-info">
                        <p><span class="label">Ticket ID:</span> #${ticket.ticket_id}</p>
                        <p><span class="label">Título:</span> ${ticket.titulo}</p>
                        <p><span class="label">Estado:</span> ${ticket.estado.toUpperCase()}</p>
                        <p><span class="label">Prioridad:</span> <span class="badge badge-${ticket.prioridad}">${ticket.prioridad.toUpperCase()}</span></p>
                        <p><span class="label">Fecha de Creación:</span> ${new Date(ticket.fecha_creacion).toLocaleString('es-GT')}</p>
                        ${ticket.datos_contacto ? `<p><span class="label">Solicitante:</span> ${ticket.datos_contacto.nombre_completo}</p>` : ''}
                    </div>
                    
                    <p>El ticket ha sido registrado y será atendido por nuestro equipo de soporte.</p>
                    
                    <div class="footer">
                        <p>Este es un correo automático. Por favor no responder.</p>
                        <p>Sistema de Soporte Petén - MINEDUC</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,

    AGENT_ASSIGNED: (ticket, agentName) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .ticket-info { background: white; padding: 20px; border-left: 4px solid #11998e; margin: 20px 0; border-radius: 4px; }
                .label { font-weight: bold; color: #11998e; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .agent-badge { background: #11998e; color: white; padding: 8px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👤 Agente Asignado</h1>
                </div>
                <div class="content">
                    <p>Se ha asignado un agente al ticket en el Sistema de Soporte Petén.</p>
                    
                    <div class="ticket-info">
                        <p><span class="label">Ticket ID:</span> #${ticket.ticket_id}</p>
                        <p><span class="label">Título:</span> ${ticket.titulo}</p>
                        <p><span class="label">Agente Asignado:</span> <span class="agent-badge">${agentName}</span></p>
                        <p><span class="label">Estado Actual:</span> ${ticket.estado.toUpperCase()}</p>
                    </div>
                    
                    <p>El agente asignado comenzará a trabajar en la resolución de este ticket.</p>
                    
                    <div class="footer">
                        <p>Este es un correo automático. Por favor no responder.</p>
                        <p>Sistema de Soporte Petén - MINEDUC</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,

    STATUS_CHANGED: (ticket, oldStatus, newStatus) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .ticket-info { background: white; padding: 20px; border-left: 4px solid #f5576c; margin: 20px 0; border-radius: 4px; }
                .label { font-weight: bold; color: #f5576c; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .status-change { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; text-align: center; }
                .status-arrow { font-size: 24px; margin: 0 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔄 Cambio de Estado</h1>
                </div>
                <div class="content">
                    <p>El estado del ticket ha sido actualizado en el Sistema de Soporte Petén.</p>
                    
                    <div class="ticket-info">
                        <p><span class="label">Ticket ID:</span> #${ticket.ticket_id}</p>
                        <p><span class="label">Título:</span> ${ticket.titulo}</p>
                        
                        <div class="status-change">
                            <strong>${oldStatus.toUpperCase()}</strong>
                            <span class="status-arrow">→</span>
                            <strong>${newStatus.toUpperCase()}</strong>
                        </div>
                        
                        <p><span class="label">Fecha de Actualización:</span> ${new Date().toLocaleString('es-GT')}</p>
                    </div>
                    
                    <p>El equipo de soporte continúa trabajando en la resolución de este ticket.</p>
                    
                    <div class="footer">
                        <p>Este es un correo automático. Por favor no responder.</p>
                        <p>Sistema de Soporte Petén - MINEDUC</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `
};

/**
 * Función centralizada para enviar notificaciones de tickets
 * @param {string} type - Tipo de notificación: 'TICKET_CREATED', 'AGENT_ASSIGNED', 'STATUS_CHANGED'
 * @param {Object} ticket - Objeto del ticket
 * @param {Object} extraData - Datos adicionales según el tipo de notificación
 * @returns {Promise<boolean>}
 */
const sendTicketNotification = async (type, ticket, extraData = {}) => {
    try {
        // Obtener destinatarios desde variable de entorno (soporta múltiples emails separados por comas)
        const recipientString = process.env.BREVO_RECIPIENT_EMAIL;

        if (!recipientString) {
            console.warn('⚠️ BREVO_RECIPIENT_EMAIL no configurado. No se envió notificación.');
            return false;
        }

        // Convertir string de emails separados por comas en array y limpiar espacios
        const recipients = recipientString
            .split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0);

        if (recipients.length === 0) {
            console.warn('⚠️ No se encontraron destinatarios válidos en BREVO_RECIPIENT_EMAIL.');
            return false;
        }

        console.log(`📧 Enviando notificación a ${recipients.length} destinatario(s):`, recipients.join(', '));

        let subject = '';
        let html = '';

        switch (type) {
            case 'TICKET_CREATED':
                subject = `✅ Nuevo Ticket #${ticket.ticket_id} - ${ticket.titulo}`;
                html = emailTemplates.TICKET_CREATED(ticket);
                break;

            case 'AGENT_ASSIGNED':
                subject = `👤 Agente Asignado - Ticket #${ticket.ticket_id}`;
                html = emailTemplates.AGENT_ASSIGNED(ticket, extraData.agentName || 'Sin nombre');
                break;

            case 'STATUS_CHANGED':
                subject = `🔄 Cambio de Estado - Ticket #${ticket.ticket_id}`;
                html = emailTemplates.STATUS_CHANGED(ticket, extraData.oldStatus, extraData.newStatus);
                break;

            default:
                console.warn(`⚠️ Tipo de notificación desconocido: ${type}`);
                return false;
        }

        return await sendEmail({
            to: recipients, // Ahora es un array de emails
            subject,
            html
        });

    } catch (error) {
        console.error('❌ Error enviando notificación de ticket:', error);
        return false;
    }
};

module.exports = sendEmail;
module.exports.sendTicketNotification = sendTicketNotification;
