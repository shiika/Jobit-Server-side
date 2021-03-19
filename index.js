const config = require("config");
const express = require("express");
const cors = require("cors");
const json = express.json();
const app = express();
const error = require("./middleware/error");
const jobSeeker = require("./routes/jobSeeker");
const validators = require("./routes/validators");

if (!config.get("jwtPrivateKey")) {
    console.log("FATAL ERROR: jwtPrivateKey is not defined");
    process.exit(1);
}

app.use(json);
app.use(cors());
app.use("/api/validate", validators);
app.use("/api/seeker", jobSeeker);

app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));