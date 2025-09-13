const path = require("path");
require("dotenv").config({
	path: path.join(__dirname, "../../../outfolder/config/.env"),
});

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Utility to get first name
const getFirstName = (name) => name.trim().split(" ")[0];

// Parameter validator
function validateParams(requiredParams, values) {
	const missingParams = [];

	requiredParams.forEach(({ key, validate }) => {
		if (!validate(values[key])) {
			missingParams.push(key);
		}
	});

	if (missingParams.length > 0) {
		throw new Error(
			`Missing or invalid email parameters: ${missingParams.join(", ")}`
		);
	}
}

// Email template generators
function generateTicketHtml({ name, company_name, schedule, id, status }) {
	return `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;"> 
			<div style="text-align: center;">
				<h1>
					<strong style="color:#FFA500;">OPEN'</strong><strong style="color:#32CD32;">SPACE</strong>
					<strong style="color:#000;"> TECHNOLOGIES INC.</strong>
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
}

function generateStatusUpdateHtml({ name, id, status, updated_at }) {
	const formattedDate = new Date(updated_at).toLocaleString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	});

	return `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
			<div style="text-align: center;">
				<h1>
					<strong style="color:#FFA500;">OPEN'</strong><strong style="color:#32CD32;">SPACE</strong>
					<strong style="color:#000;"> TECHNOLOGIES INC.</strong>
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
}

// Main email sending function
async function sendEmail({ toEmail, subject, html }, res) {
	try {
		const { data, error } = await resend.emails.send({
			from: `OpenSpace Technologies Inc. <${process.env.EMAIL_USER}>`,
			to: toEmail,
			subject,
			html,
		});

		if (error) {
			console.error("❌ Email failed to send:", error);
			if (res) return res.status(400).json({ success: false, error });
			return;
		}

		console.log("✅ Email sent successfully:", data);
		if (res) res.status(200).json({ success: true, data });
	} catch (err) {
		console.error("🚨 Server error while sending email:", err);
		if (res) {
			res
				.status(500)
				.json({ success: false, message: "Internal Server Error", error: err });
		}
	}
}

// Exported functions

async function sentEmail(
	{ name, company_name, schedule, id, status, toEmail },
	res
) {
	validateParams(
		[
			{ key: "name", validate: (v) => !!v },
			{ key: "company_name", validate: (v) => !!v },
			{ key: "schedule", validate: (v) => !!v },
			{ key: "id", validate: (v) => !!v },
			{
				key: "status",
				validate: (v) => ["OPEN", "IN-PROGRESS", "CLOSED"].includes(v),
			},
			{ key: "toEmail", validate: (v) => !!v },
		],
		{ name, company_name, schedule, id, status, toEmail }
	);

	const html = generateTicketHtml({ name, company_name, schedule, id, status });
	const subject = `Support Ticket Confirmation - Ticket ID: ${id}`;

	await sendEmail({ toEmail, subject, html }, res);
}

async function sendStatusUpdateEmail(
	{ name, id, status, toEmail, updated_at },
	res
) {
	validateParams(
		[
			{ key: "name", validate: (v) => !!v },
			{ key: "id", validate: (v) => !!v },
			{
				key: "status",
				validate: (v) => ["OPEN", "IN-PROGRESS", "CLOSED"].includes(v),
			},
			{ key: "toEmail", validate: (v) => !!v },
			{ key: "updated_at", validate: (v) => !!v },
		],
		{ name, id, status, toEmail, updated_at }
	);

	const html = generateStatusUpdateHtml({ name, id, status, updated_at });
	const subject = `Support Ticket Status Update - Ticket ID: ${id}`;

	await sendEmail({ toEmail, subject, html }, res);
}

module.exports = {
	sentEmail,
	sendStatusUpdateEmail,
};
