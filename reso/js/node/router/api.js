// reso/js/node/router/api.js
const express = require("express");
const router = express.Router();
const db = require("../db");
// const sentEmail = require('../email');
// const sendStatusUpdateEmail = require('../email');
const { sentEmail, sendStatusUpdateEmail } = require("../email");

const rateLimit = require("express-rate-limit");

// Rate limiting: max 100 requests per 15 minutes
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: "Too many requests, please try again later.",
});
router.use("/request-ticket", limiter);

// Generate a 12-character ID with uppercase letters and numbers
async function generateTicketID() {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let ticketID = "";
	for (let i = 0; i < 12; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		ticketID += characters[randomIndex];
	}

	// Check for uniqueness
	const [rows] = await db
		.promise()
		.query("SELECT id FROM support_request WHERE id = ?", [ticketID]);
	if (rows.length > 0) {
		return generateTicketID(); // Recursively generate a new ID if collision occurs
	}
	return ticketID;
}

router.post("/request-ticket", async (req, res) => {
	const {
		company_name,
		name,
		email,
		contact_numb,
		address,
		schedule,
		subject,
		description,
	} = req.body;

	// Log request body for debugging
	console.log("Request body:", req.body);

	// Validate required fields
	const requiredFields = {
		company_name,
		name,
		email,
		contact_numb,
		address,
		schedule,
		subject,
		description,
	};
	const missingFields = Object.keys(requiredFields).filter(
		(key) => !requiredFields[key]
	);
	if (missingFields.length > 0) {
		console.error("Missing fields:", missingFields);
		return res.status(400).json({
			error: `Missing required fields: ${missingFields
				.map((key) => key.replace("_", " "))
				.join(", ")}`,
		});
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		console.error("Invalid email:", email);
		return res.status(400).json({ error: "Invalid email format" });
	}

	try {
		// Generate unique ticket ID
		const ticketID = await generateTicketID();
		console.log("Generated ticketID:", ticketID);

		// Insert into database with status set to OPEN
		const query = `
            INSERT INTO support_request (id, company_name, name, email, contact_numb, address, schedule, subject, description, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,'OPEN', NOW())
        `;
		// console.log('Executing query with values:', [
		//     ticketID,
		//     company_name,
		//     name,
		//     email,
		//     contact_numb,
		//     address,
		//     schedule,
		//     description
		// ]);
		const [result] = await db
			.promise()
			.query(query, [
				ticketID,
				company_name,
				name,
				email,
				contact_numb,
				address,
				schedule,
				subject,
				description,
			]);

		const emailParams = {
			name,
			company_name,
			schedule,
			id: ticketID,
			status: "OPEN",
			toEmail: email,
		};

		console.log("Email parameters:", emailParams);
		await sentEmail(emailParams);

		return res.status(201).json({
			status: "success", //! this line is being updated that resolved the issue appeared previously
			ticketID,
			message: "Service request submitted successfully",
		});
	} catch (error) {
		console.error("Error processing request:", {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
			requestBody: req.body,
		});
		return res
			.status(500)
			.json({ error: `Internal server error: ${error.message}` });
	}
});

router.get("/filter-tickets-details", async (req, res) => {
	try {
		// const query = `SELECT id, status, company_name, name, subject, description, priority, schedule, category, address, contact_numb, assigned_team, team_leader, email, created_at, updated_at FROM support_request`;
		const query = `SELECT * FROM support_request`;
		const [rows] = await db.promise().query(query);

		return res.status(200).json({
			tickets: rows,
			message: "Tickets retrieved successfully",
		});
	} catch (error) {
		console.error("Error fetching tickets:", {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
		});
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/ticket/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const query = `SELECT * FROM support_request WHERE id = ?`;
		const [rows] = await db.promise().query(query, [id]);

		if (rows.length === 0) {
			return res.status(404).json({ error: "Ticket not found" });
		}

		return res.status(200).json({
			ticket: rows[0],
			message: "Ticket retrieved successfully",
		});
	} catch (error) {
		console.error("Error fetching ticket:", {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
		});
		return res
			.status(500)
			.json({ error: `Internal server error: ${error.message}` });
	}
});

router.put("/ticket/:id", async (req, res) => {
	const { id } = req.params;
	const {
		status,
		priority,
		category,
		assigned_team,
		team_leader,
		assigned_person,
		updated_at,
		current_level,
		current_action,
		current_attempt,
	} = req.body;

	try {
		// Fetch current ticket data to get name, toEmail, and previous status
		const [currentTicket] = await db
			.promise()
			.query("SELECT name, email, status FROM support_request WHERE id = ?", [
				id,
			]);
		if (!currentTicket.length) {
			return res.status(404).json({ error: "Ticket not found" });
		}

		// Update the ticket in the database
		const query = `UPDATE support_request SET status = ?,
            priority = ?,
            category = ?,
            assigned_team = ?,
            team_leader = ?,
            assigned_person = ?,
            updated_at = ?,
            current_level = ?,
            current_action = ?,
            current_attempt = ? 
            WHERE id = ?`;

		const [result] = await db.promise().query(query, [
			status,
			priority,
			category,
			assigned_team,
			team_leader,
			assigned_person,
			updated_at || new Date(), // Use provided updated_at or current timestamp
			current_level,
			current_action,
			current_attempt,
			id,
		]);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "Ticket not found" });
		}

		// Send email if status has changed
		if (status && status !== currentTicket[0].status) {
			await sendStatusUpdateEmail({
				name: currentTicket[0].name,
				id,
				status,
				toEmail: currentTicket[0].email,
				updated_at: updated_at || new Date(),
			});

			// Optional: Log email in the database
			// await db.promise().query(
			//     'INSERT INTO email_logs (ticket_id, email_type, status, sent_at) VALUES (?, ?, ?, ?)',
			//     [id, 'status_update', status, new Date()]
			// );
		}

		return res.status(200).json({
			message: "Ticket updated successfully",
		});
	} catch (error) {
		console.error("Error updating ticket:", {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
		});

		return res
			.status(500)
			.json({ error: `Internal server error: ${error.message}` });
	}
});

router.put("/ticket-level-tohistory/:id", async (req, res) => {
	const { id } = req.params;
	const {
		current_level,
		current_action,
		current_attempt,
		escalation_level_history,
		updated_at,
	} = req.body;

	try {
		// Verify ticket exists
		const [currentTicket] = await db
			.promise()
			.query("SELECT name, email, status FROM support_request WHERE id = ?", [
				id,
			]);
		if (!currentTicket.length) {
			return res.status(404).json({ error: "Ticket not found" });
		}

		// Update query including updated_at
		const query = `UPDATE support_request SET current_level = ?, current_action = ?, current_attempt = ?, escalation_level_history = ?, updated_at = ? WHERE id = ?`;

		const [result] = await db.promise().query(query, [
			current_level,
			current_action,
			current_attempt,
			JSON.stringify(escalation_level_history),
			updated_at, // Use the client-provided updated_at
			id,
		]);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "Ticket not found" });
		}

		return res.status(200).json({
			message: "Escalation level updated successfully",
		});
	} catch (error) {
		console.error("Error updating ticket:", {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
		});
		return res
			.status(500)
			.json({ error: `Internal server error: ${error.message}` });
	}
});

router.get("/filter-tickets-details/stats", async (req, res) => {
	try {
		const { status, priority } = req.query; // Get status from query parameters
		let query = "SELECT * FROM support_request";
		let queryParams = [];

		// If status is provided, add WHERE clause
		if (status) {
			query += " WHERE status = ?";
			queryParams.push(status);
		} else if (priority) {
			query += " WHERE priority = ?";
			queryParams.push(priority);
		}

		const [rows] = await db.promise().query(query, queryParams);

		return res.status(200).json({
			tickets: rows,
			message: "Tickets retrieved successfully",
		});
	} catch (error) {
		console.error("Error fetching tickets:", {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
		});
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/search", async (req, res) => {
	//   console.log('Search endpoint is on the run!');
	const query = req.query.q ? `%${req.query.q}%` : "";
	const id =
		!isNaN(req.query.q) && req.query.q.match(/^\d+$/)
			? parseInt(req.query.q)
			: null;

	if (!req.query.q || req.query.q.length > 100) {
		return res.status(400).json({ error: "Invalid search query" });
	}

	try {
		const sqlQuery =
			id !== null
				? `SELECT * FROM support_request 
       WHERE id = ? OR
             status LIKE ? OR company_name LIKE ? OR
             name LIKE ? OR address LIKE ? OR 
             description LIKE ? OR schedule LIKE ? OR 
             assigned_team LIKE ? OR team_leader LIKE ? OR 
             priority LIKE ? OR email LIKE ? OR 
             contact_numb LIKE ? OR subject LIKE ? OR 
             category LIKE ? OR assigned_person LIKE ?`
				: `SELECT * FROM support_request 
       WHERE status LIKE ? OR company_name LIKE ? OR
             name LIKE ? OR address LIKE ? OR 
             description LIKE ? OR schedule LIKE ? OR 
             assigned_team LIKE ? OR team_leader LIKE ? OR 
             priority LIKE ? OR email LIKE ? OR 
             contact_numb LIKE ? OR subject LIKE ? OR 
             category LIKE ? OR assigned_person LIKE ?`;
		const queryParams =
			id !== null
				? [
						id,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
				  ]
				: [
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
						query,
				  ];
		const [results] = await db.promise().query(sqlQuery, queryParams);
		// console.log('Query results:', results);

		if (results.length === 0) {
			return res.status(404).json({ error: "No data found" });
		}

		return res.status(200).json({
			results,
			count: results.length,
			query: req.query.q,
		});
	} catch (error) {
		console.error("Error processing request:", {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
			requestQuery: req.query,
		});
		return res.status(500).json({
			error: "Database query failed",
			message: error.message,
		});
	}
});

router.get("/counts", async (req, res) => {
	try {
		const query = `
            SELECT status, priority, COUNT(*) as count
            FROM support_request
            WHERE status IN ('OPEN', 'IN-PROGRESS', 'CLOSED')
                AND priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
            GROUP BY status, priority
        `;
		const [results] = await db.promise().query(query);
		// console.log('Status and priority counts:', results);

		const counts = {
			status: {
				OPEN: 0,
				"IN-PROGRESS": 0,
				CLOSED: 0,
			},
			priority: {
				LOW: 0,
				MEDIUM: 0,
				HIGH: 0,
				CRITICAL: 0,
			},
		};

		results.forEach((row) => {
			if (counts.status[row.status] !== undefined) {
				counts.status[row.status] += row.count;
			}
			if (counts.priority[row.priority] !== undefined) {
				counts.priority[row.priority] += row.count;
			}
		});

		const total = results.reduce((sum, row) => sum + row.count, 0);

		return res.status(200).json({
			counts,
			total,
		});
	} catch (error) {
		console.error("Error fetching status and priority counts:", {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
		});
		return res.status(500).json({
			error: "Database query failed",
			message: error.message,
		});
	}
});

router.post("/users", async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res
				.status(400)
				.json({ error: "Username and password are required" });
		}

		if (username.length > 100 || password.length > 100) {
			return res
				.status(400)
				.json({ error: "Username or password exceeds maximum length" });
		}

		const query = "SELECT id, username, password FROM users WHERE username = ?";
		const [rows] = await db.promise().query(query, [username]);

		if (rows.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const user = rows[0];

		if (password !== user.password) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		return res.status(200).json({
			// message: 'User authenticated successfully',
			message: "./pages/dashboard.html",
			data: { id: user.id, username: user.username },
		});
	} catch (error) {
		console.error("Error authenticating user:", {
			message: error.message,
			code: error.code,
			errno: error.errno,
			sql: error.sql,
			sqlMessage: error.sqlMessage,
		});
		return res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
