const express = require('express');
const router = express.Router();
const validateInterests = require("../models/validators/interests");
const validateProf = require("../models/validators/prof-info");
const JobSeeker = require("../models/jobSeeker.model");
const auth = require("../middleware/auth");

router.get("/exp", auth, (req, res, next) => {
    const userId = req.header("seeker-id") || req.user.ID;
    JobSeeker.getExp(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.put("/update", auth, (req, res, next) => {
    const userId = req.user.ID;
    JobSeeker.updateSeeker(req.body, userId, req.body.phone, (err, results) => {
        console.log(req.body);
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.put("/update-interests", auth, (req, res, next) => {
    const userId = req.user.ID;
    JobSeeker.updateInterests(req.body, userId, (err, results) => {
        console.log(req.body);
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.delete("/del-exp", auth, (req, res, next) => {
    JobSeeker.removeExp(req.query.id, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send("Experience has been deleted");
    });
});

router.get("/edu", auth, (req, res, next) => {
    const userId = req.header("seeker-id") || req.user.ID;
    JobSeeker.getEdu(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.get("/profile", auth, (req, res, next) => {
    const userId = req.header("seeker-id") || req.user.ID;
    JobSeeker.getSeeker(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.get("/get-interests", auth, (req, res, next) => {
    const userId = req.user.ID;
    JobSeeker.getInterests(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.get("/skills", auth, (req, res, next) => {
    const userId = req.header("seeker-id") || req.user.ID;
    JobSeeker.getSkills(userId, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

router.get("/langs", auth, (req, res, next) => {
    const userId = req.header("seeker-id") || req.user.ID;
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

router.post("/add-exp", auth, (req, res, next) => {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    req.body.startDate = `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`;
    req.body.endDate = `${endDate.getFullYear()}-${endDate.getMonth()}-${endDate.getDate()}`;

    JobSeeker.addExp(req.user.ID, {...req.body, start_date: req.body.startDate, end_date: req.body.endDate}, (err, results) => {
        if (err) return next(err);
        res.send("Experience addedd successfully");
    })

});

router.post("/add-edu", auth, (req, res, next) => {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    req.body.startDate = `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`;
    req.body.endDate = `${endDate.getFullYear()}-${endDate.getMonth()}-${endDate.getDate()}`;

    JobSeeker.addEdu(req.user.ID, {...req.body, start_date: req.body.startDate, end_date: req.body.endDate}, (err, results) => {
        if (err) return next(err);
        res.status(200).send("Education addedd successfully");
    })

})

module.exports = router;
