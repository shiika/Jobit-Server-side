const express = require('express');
const router = express.Router();
const Employer = require("../models/employer.model");
const validateInterests = require("../models/validators/interests");

router.post("/post", (req, res, next) => {
    const userType = req.headers["x-user-type"];
    if (userType != "employer") {
        return res.status(401).send("You don't have permission to post job");
    }

    const publishDate = new Date(req.body.job.publishDate);
    req.body.job.publishDate = `${publishDate.getFullYear()}-${publishDate.getMonth()}-${publishDate.getDate()}`;

    const expireDate = new Date(req.body.job.expireDate);
    req.body.job.expireDate = `${expireDate.getFullYear()}-${expireDate.getMonth()}-${expireDate.getDate()}`;

    Employer.postJob(req.body.credentials, req.body.job, (err, results) => {
        if (err) return next(err);
        res.send(results);
        // res.send(results);
    })
});

module.exports = router;