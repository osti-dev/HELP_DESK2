const express = require("express");
const serverApp = express();
const path = require("path");
const dotenv = require("dotenv");
const apiExpress = require("./reso/js/node/router/api");
const cors = require("cors");

serverApp.use(cors());
serverApp.use(express.json());
serverApp.use(express.static(path.join(__dirname, "outfolder")));
serverApp.use(express.static(path.join(__dirname, "reso")));
serverApp.use("/api", apiExpress);

dotenv.config({ path: path.join(__dirname, "outfolder", "config", ".env") });
const PORT = process.env.PORT || 8190; // Fallback port

serverApp.get("/", (req, res) => {
	res.status(200).sendFile(path.join(__dirname, "index.html"));
});

serverApp.get("/adminlgpg", (req, res) => {
	res
		.status(200)
		.sendFile(path.join(__dirname, "reso", "pages", "adminlogpg.html"));
});

// serverApp.get('/create', (req, res) => {
//     res.status(200).sendFile(path.join(__dirname, 'reso', 'pages', 'create.html'));
// });

serverApp.listen(PORT, () => {
	console.log(`App is listening to http://localhost:${PORT}`);
});
