const express = require('express');
const router = express.Router();
const validateInterests = require("../models/validators/interests");
const validateProf = require("../models/validators/prof-info");
const JobSeeker = require("../models/jobSeeker.model");

router.get("/exp", (req, res, next) => {
    const userId = req.header("user-id");
    JobSeeker.getExp(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.delete("/del-exp", (req, res, next) => {
    JobSeeker.removeExp(req.query.id, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.get("/edu", (req, res, next) => {
    const userId = req.header("user-id");
    JobSeeker.getEdu(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.get("/profile", (req, res, next) => {
    const userId = req.header("user-id");
    JobSeeker.getSeeker(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.get("/skills", (req, res, next) => {
    const userId = req.header("user-id");
    JobSeeker.getSkills(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.get("/langs", (req, res, next) => {
    const userId = req.header("user-id");
    JobSeeker.getLangs(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.post("/interests", (req, res, next) => {
    const { error } = validateInterests(req.body);
    if (error) return res.status(400).send(`Bad request.Validate user: ${error}`);

    JobSeeker.addInterests(req.body, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send("Career interests has been added");
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
        res.send("Professional info has been added");
    });
});

router.post("/add-exp", (req, res, next) => {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    req.body.startDate = `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`;
    req.body.endDate = `${endDate.getFullYear()}-${endDate.getMonth()}-${endDate.getDate()}`;

    JobSeeker.addExp(req.header("user-id"), {...req.body, start_date: req.body.startDate, end_date: req.body.endDate}, (err, results) => {
        if (err) return next(err);
        res.status(200).send("Experience addedd successfully");
    })

});

router.post("/add-edu", (req, res, next) => {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    req.body.startDate = `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`;
    req.body.endDate = `${endDate.getFullYear()}-${endDate.getMonth()}-${endDate.getDate()}`;

    JobSeeker.addEdu(req.header("user-id"), {...req.body, start_date: req.body.startDate, end_date: req.body.endDate}, (err, results) => {
        if (err) return next(err);
        res.status(200).send("Experience addedd successfully");
    })

})

module.exports = router;
