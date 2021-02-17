const config = require("config");
const express = require("express");
const json = express.json();
const app = express();
const error = require("./middleware/error");
const jobSeeker = require("./routes/jobSeeker");

if (!config.get("jwtPrivateKey")) {
    console.log("FATAL ERROR: jwtPrivateKey is not defined");
}

app.use(json);
app.use("/api", jobSeeker);

app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));