CREATE TABLE support_requests
(
	id VARCHAR(12) PRIMARY KEY,
    status 	ENUM('OPEN', 'IN-PROGRESS', 'CLOSED'),
    company_name VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact_numb INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    schedule DATE NOT NULL,
    assigned_team VARCHAR(100) NOT NULL,
    team_leader VARCHAR(100) NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
);

-- sample reference
-- DROP TABLE IF EXISTS support_request;
-- CREATE TABLE support_request (
--     id VARCHAR(12) PRIMARY KEY,
--     company_name VARCHAR(255) NOT NULL,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) NOT NULL,
--     contact_numb VARCHAR(50) NOT NULL,
--     address TEXT NOT NULL,
--     schedule DATE NOT NULL,
--     description TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     status ENUM('OPEN', 'IN-PROGRESS', 'CLOSED') NOT NULL DEFAULT 'OPEN'
-- );