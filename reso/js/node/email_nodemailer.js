const nodemailer = require('nodemailer');
require('dotenv').config({
    path: require('path').join(__dirname, '../../../outfolder/config/.env')
});

async function sentEmail({ name, company_name, schedule, id, status, toEmail }) {
    // Validate parameters with specific error messages
    const missingParams = [];
    if (!name) missingParams.push('name');
    if (!company_name) missingParams.push('company_name');
    if (!schedule) missingParams.push('schedule');
    if (!id) missingParams.push('id');
    if (!toEmail) missingParams.push('toEmail');
    if (!status || !['OPEN', 'IN-PROGRESS', 'CLOSED'].includes(status)) {
        missingParams.push('status (must be OPEN, IN-PROGRESS, or CLOSED)');
    }
    if (missingParams.length > 0) {
        throw new Error(`Missing or invalid email parameters: ${missingParams.join(', ')}`);
    }

    function getFirstName(name){
        return name.trim().split(' ')[0];
    }

    // Use full URL for logo to ensure email client compatibility
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;"> 
            <div style="text-align: center;">

                <h1>
  <strong style="color:#FFA500 !important;">OPEN'</strong><strong style="color:#32CD32 !important;">SPACE</strong>
  <strong style="color:#000000 !important;"> TECHNOLOGIES INC.</strong>
</h1>
                
                <h1 style="color: #333;">Support Ticket Confirmation</h1>
            </div>
            <p style="color: #333;">Dear ${getFirstName(name)},</p>
            <p style="color: #333;">Thank you for reaching out to Open'Space Technologies Inc. Client Support. We have received your inquiry from ${company_name}, scheduled for ${schedule}. Our team is committed to addressing your concern promptly and efficiently.</p>
            <div style="background: #f9f9f9; padding: 10px; border-radius: 5px;">
                <p style="margin: 0;"><span style="font-weight: bold;">Ticket Reference Number:</span> ${id}</p>
                <p style="margin: 0;"><span style="font-weight: bold;">Status:</span> ${status}</p>
            </div>
            <p style="color: #333;">Please retain this ticket reference number for future correspondence. We will keep you updated on the progress of your request. If you have any further questions, feel free to contact us at <a href="mailto:support.osti@osti.com.ph" style="color: #007bff;">support.osti@osti.com.ph</a>.
            You may also visit our website at <a href="https://osti.com.ph/" style= "color: #007bff;">https://osti.com.ph/</a> for more information.</p>
            <p style="color: #333;">Best regards,</p>
            <p style="color: #333;">The Open'Space Technologies Inc. Support Team</p>
            <div style="text-align: center; color: #777; font-size: 12px; margin-top: 20px;">
                <p>Open'Space Technologies Inc. | 761, Zosa Bldg, Dionisio Jakosalem St, Cebu City, 6000 Cebu, Philippines</p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
                <p>© ${new Date().getFullYear()} Open'Space Technologies Inc. All rights reserved.</p>
            </div>
        </div>
    `;

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            logger: true,
            debug: true
        });

const info = await transporter.sendMail({
  from: `"OpenSpace Technologies Inc." <${process.env.EMAIL_USER}>`,
  to: toEmail,
  subject: `Support Ticket Confirmation - Ticket ID: ${id}`,
  html,
});

        console.log('Message sent: ' + info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (e) {
        console.error('Error sending email:', e);
        throw new Error(`Failed to send confirmation email: ${e.message}`);
    }
}

async function sendStatusUpdateEmail({ name, id, status, toEmail, updated_at }) {
    // Validate parameters
    const missingParams = [];
    if (!name) missingParams.push('name');
    if (!id) missingParams.push('id');
    if (!toEmail) missingParams.push('toEmail');
    if (!status || !['OPEN', 'IN-PROGRESS', 'CLOSED'].includes(status)) {
        missingParams.push('status (must be OPEN, IN-PROGRESS, or CLOSED)');
    }
    if (!updated_at) missingParams.push('updated_at');
    if (missingParams.length > 0) {
        throw new Error(`Missing or invalid email parameters: ${missingParams.join(', ')}`);
    }

    // Format updated_at for display
    const formattedDate = new Date(updated_at).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    function getFirstName(name){
        return name.trim().split(' ')[0];
    }

    // Email template for status update
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
            <div style="text-align: center;">

                <h1>
  <strong style="color:#FFA500 !important;">OPEN'</strong><strong style="color:#32CD32 !important;">SPACE</strong>
  <strong style="color:#000000 !important;"> TECHNOLOGIES INC.</strong>
</h1>

                <h1 style="color: #333;">Support Ticket Update</h1>
            </div>
            <p style="color: #333;">Dear ${getFirstName(name)},</p>
            <p style="color: #333;">We have an update on your support ticket (Ticket ID: ${id}).</p>
            <div style="background: #f9f9f9; padding: 10px; border-radius: 5px;">
                <p style="margin: 0;"><span style="font-weight: bold;">Ticket Reference Number:</span> ${id}</p>
                <p style="margin: 0;"><span style="font-weight: bold;">Status:</span> ${status}</p>
                <p style="margin: 0;"><span style="font-weight: bold;">Updated On:</span> ${formattedDate}</p>
            </div>
            <p style="color: #333;">Please retain this ticket reference number for future correspondence. If you have any further questions, feel free to contact us at <a href="mailto:support.osti@osti.com.ph" style="color: #007bff;">support.osti@osti.com.ph</a>.
            You may also visit our website at <a href="https://osti.com.ph/" style= "color: #007bff;">https://osti.com.ph/</a> for more information.</p>
            <p style="color: #333;">Best regards,</p>
            <p style="color: #333;">The Open'Space Technologies Inc. Support Team</p>
            <div style="text-align: center; color: #777; font-size: 12px; margin-top: 20px;">
                <p>Open'Space Technologies Inc. | 761, Zosa Bldg, Dionisio Jakosalem St, Cebu City, 6000 Cebu, Philippines </p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
                <p>© ${new Date().getFullYear()} Open'Space Technologies Inc. All rights reserved.</p>
            </div>
        </div>
    `;

    try {
        const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  logger: true,
  debug: true
});

const info = await transporter.sendMail({
  from: `"OpenSpace Technologies Inc." <${process.env.EMAIL_USER}>`,
  to: toEmail,
  subject: `Support Ticket Confirmation - Ticket ID: ${id}`,
  html,
});

        console.log('Status update email sent: ' + info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (e) {
        console.error('Error sending status update email:', e);
        throw new Error(`Failed to send status update email: ${e.message}`);
    }
}

// module.exports = sentEmail;
// module.exports = sendStatusUpdateEmail;
// module.exports = {sentEmail, sendStatusUpdateEmail };

module.exports = { sentEmail, sendStatusUpdateEmail };
