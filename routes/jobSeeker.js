const express = require('express');
const router = express.Router();
const validateUser = require("../models/validators/user");
const validateInterests = require("../models/validators/interests");
const validateProf = require("../models/validators/prof-info");
const JobSeeker = require("../models/jobSeeker.model");

router.get("/", (req, res) => {
    res.send("Seeker accessed!");
});

router.get("/titles", (req, res, next) => {
    JobSeeker.getTitles((error, results) => {
        if (error) return next(error);
        res.send(results)
    })
});

router.post("/auth/register", (req, res, next) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(`Bad request.Validate user: ${error}`);

    let {phone, ...newSeeker} = req.body;
    const birth_date = new Date(newSeeker.birth_date);

    newSeeker.birth_date = `${birth_date.getFullYear()}-${birth_date.getMonth()}-${birth_date.getDate()}`;

    JobSeeker.createSeeker(newSeeker, phone, (err, results, fields) => {
        if (err) return next(err);
        res.send(results);
    });
});

router.post("/interests", (req, res, next) => {
    const { error } = validateInterests(req.body);
    if (error) return res.status(400).send(`Bad request.Validate user: ${error}`);

    JobSeeker.addInterests(req.body, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.post("/prof-info", (req, res, next) => {
    const { error } = validateProf(req.body);
    if (error) return res.status(400).send(`Bad request.Validate user: ${error}`);
    const startDate = new Date(req.body.qualification.startDate);
    const endDate = new Date(req.body.qualification.endDate);
    req.body.qualification.startDate = `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`;
    req.body.qualification.endDate = `${endDate.getFullYear()}-${endDate.getMonth()}-${endDate.getDate()}`;

    JobSeeker.addProfInfo(req.body, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

module.exports = router;
