const express = require('express');
const router = express.Router();
const Employer = require("../models/employer.model");
const auth = require("../middleware/auth");
const validateInterests = require("../models/validators/interests");

router.post("/post", (req, res, next) => {
    
    const publishDate = new Date(req.body.publishDate);
    req.body.publishDate = `${publishDate.getFullYear()}-${publishDate.getMonth()}-${publishDate.getDate()}`;
    
    const expireDate = new Date(req.body.expireDate);
    req.body.expireDate = `${expireDate.getFullYear()}-${expireDate.getMonth()}-${expireDate.getDate()}`;
    
    Employer.postJob(req.headers["x-access-token"], req.body, (err, results) => {
        
        if (err) return next(err);
        else if (err === "Unauthorized") return res.status(401).send("You dont have permission to post a job!");
        res.send(results);
    })
});

router.get("/employees", auth, (req, res, next) => {
    const userId = req.user.ID;
    Employer.getEmployees(userId, (err, employees) => {
        if (err) return next(err);
        res.status(200).send(employees)
    })
});

router.get("/jobs", auth, (req, res, next) => {
    const userId = req.user.ID;
    Employer.getJobs("factor", userId, (err, jobs) => {
        if (err) return next(err);
        res.status(200).send(jobs)
    })
});

router.get("/skills", auth, (req, res, next) => {
    const jobId = req.header("job-id");
    Employer.getSkills(jobId, (err, jobs) => {
        if (err) return next(err);
        res.status(200).send(jobs)
    })
});

module.exports = router;