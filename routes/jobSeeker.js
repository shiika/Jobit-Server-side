const express = require('express');
const Joi = require('joi');
const router = express.Router();
const JobSeeker = require("../models/jobSeeker.model");

router.post("/signUp", (req, res, next) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(`Bad request.Validate user: ${error}`);

    const newSeeker = new JobSeeker();

    newSeeker.createSeeker(req.body, (err, results) => {
        if (err) return next(err.sqlMessage);
        res.send(results);
    });
});

function validateUser(user) {
    const schema = Joi.object({
        gender: Joi.string().required(),
        birth_date: Joi.date().required(),
        email: Joi.string().required(),
        password: Joi.string().required().min(8),
        cv: Joi.string(),
        marital_status: Joi.string().required(),
        military_status: Joi.string().required(),
        first_name: Joi.string().required().min(3),
        last_name: Joi.string().required().min(3),
        location: Joi.string().required(),
        age: Joi.number()
    });

    return schema.validate(user)
}

module.exports = router;
