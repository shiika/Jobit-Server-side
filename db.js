const mysql = require("mysql");
const config = require("config");
const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.get("db.host"),
    port: config.get("db.port"),
    user: config.get("db.user"),
    password: config.get("db.password"),
    database: config.get("db.database"),
});

// connection.connect((err) => {
//     if (err) return console.log("error connecting!");
//     console.log("Successfully connected to MySQL!")
// });
pool.on('connection', function (connection) {
    console.log("Successfully connected to MySQL!")
  });

module.exports = pool;