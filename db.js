const mysql = require("mysql");
const config = require("config");
const connection = mysql.createConnection({
    host: config.get("db.host"),
    port: config.get("db.port"),
    user: config.get("db.user"),
    password: config.get("dbPassword"),
    database: config.get("db.database"),
});

connection.connect((err) => {
    if (err) return console.log("error connecting!");
    console.log("Successfully connected to MySQL!")
});

module.exports = connection;