const express = require('express');
const router = express.Router();
const validateEmployer = require("../models/validators/employer");
const Employer = require("../models/employer.model");

router.post("/auth/register", (req, res, next) => {
    const { error } = validateEmployer(req.body);
    if (error) return res.status(400).send(`Bad request.Validate user: ${error}`);

    Employer.createEmployer(req.body, (err, results) => {
        if (err) return next(err);
        res.send(results);
    });
});

module.exports = router;
