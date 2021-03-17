const router = require('express').Router();
const JobSeeker = require("../models/jobSeeker.model");


router.post("/checkEmail", (req, res, next) => {
    const email = req.body.email;
    JobSeeker.checkEmail(email, (err, result) => {
        if (err) return next(err.sqlMessage);
        res.send(result[0]);
    });
});

router.post("/checkPhone", (req, res, next) => {
    const phone = req.body.phone;
    JobSeeker.checkPhone(phone, (err, result) => {
        if (err) return next(err.sqlMessage);
        res.send(result[0]);
    });
});

module.exports = router;