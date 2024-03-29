const express = require('express');
const router = express.Router();
const validateUser = require("../models/validators/user");
const Mock = require("../mock/employers");
const validateEmployer = require("../models/validators/employer");
const signup = require('../middleware/signup');
const JobSeeker = require("../models/jobSeeker.model");
const Auth = require("../models/auth.model");

router.get("/company-locations", (req, res, next) => {
    Auth.getLocations((err, results) => {
        if (err) return next(err);
        res.send(results);
    })
})

router.post("/register", signup, (req, res, next) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(`Bad request.Validate user: ${error}`);

    let {phone, ...newSeeker} = req.body;
    const birth_date = new Date(newSeeker.birth_date);

    newSeeker.birth_date = `${birth_date.getFullYear()}-${birth_date.getMonth()}-${birth_date.getDate()}`;

    JobSeeker.createSeeker(newSeeker, phone, (err, results, fields) => {
        if (err) return next(err);
        res.send("Seeker created successfully");
    });
});

router.post("/emp-register", signup, (req, res, next) => {
    const { error } = validateEmployer(req.body);
    if (error) return res.status(400).send(`Bad request.Validate user: ${error}`);

    Auth.createEmployer(req.body, (err, results) => {
        if (err) return next(err);
        res.send("Successfully signed up");
    });
});

router.post("/mock-emp", (req, res, next) => {
    // const { error } = validateEmployer(req.body);
    // if (error) return res.status(400).send(`Bad request.Validate user: ${error}`);

    req.body.forEach((item, index) => {
        Mock.mockPost(item, (err, results) => {
            if (err) return next(err);
            if (index == req.body.length - 1) res.send("Mock employers added");
        });
    })
});

router.post("/login", (req, res, next) => {
    const credentials = req.body;
    const userType = req.header("x-user-type");
    Auth.authUser(credentials, userType, (err, credentials) => {
        if (err) return res.status(401).send(err);
        res.send(credentials);
    });
})

module.exports = router;