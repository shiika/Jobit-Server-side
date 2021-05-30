const express = require('express');
const router = express.Router();
const Job = require("../models/job.model");
const auth = require("../middleware/auth");

router.post("/post", auth, (req, res, next) => {
    
    const publishDate = new Date(req.body.publishDate);
    req.body.publishDate = `${publishDate.getFullYear()}-${publishDate.getMonth()}-${publishDate.getDate()}`;
    
    const expireDate = new Date(req.body.expireDate);
    req.body.expireDate = `${expireDate.getFullYear()}-${expireDate.getMonth() + 1}-${expireDate.getDate()}`;
    
    Job.postJob(req.header("x-auth-token"), req.body, (err, results) => {
        
        if (err) return next(err);
        else if (err === "Unauthorized") return res.status(401).send("You dont have permission to post a job!");
        res.send(results);
    })
});

router.get("/apply", auth, (req, res, next) => {
    const userId = req.user.ID;
    const jobId= req.header("job-id");
    const date = `${new Date().getFullYear()}-${(new Date().getMonth()) + 1}-${new Date().getDate()}`;
    Job.applyForJob(jobId, userId, date, (err, results) => {
        if (err) return next(err);
        res.send("You have successfully applied to the job")
    })
});

router.get("/save", auth, (req, res, next) => {
    const userId = req.user.ID;
    const jobId= req.header("job-id");
    Job.saveJob(+jobId, userId, (err, results) => {
        if (err) return next(err);
        res.send("Job has been saved successfully");
    })
});

router.get("/saved", auth, (req, res, next) => {
    const userId = req.user.ID;
    Job.getSaved(userId, (err, results) => {
        if (err) return next(err);
        res.send(results);
    })
});

router.delete("/unsave", auth, (req, res, next) => {
    const userId = req.user.ID;
    const jobId= req.header("job-id");
    Job.removeJob(+jobId, userId, (err, results) => {
        if (err) return next(err);
        res.send("Job has been unsaved successfully");
    })
});

router.get("/jobs", auth, (req, res, next) => {
    const empId = req.user.ID;
    Job.getEmployerJob(empId, (err, results) => {
        if (err) return next(err);
        res.send(results);
    })
});

module.exports = router;