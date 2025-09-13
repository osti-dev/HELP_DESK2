const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../../../outfolder/config/.env')
});

let connection;

function handleDisconnect() {
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to DB:', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Connected to the database successfully!');
        }
    });

    connection.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.warn('DB connection lost. Reconnecting...');
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = connection;
