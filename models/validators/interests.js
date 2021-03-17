const Joi = require("Joi");

module.exports = function(interests) {
    const schema = Joi.object({
        min_salary: Joi.string().min(4),
        educationLevel: Joi.string().min(4),
        status: Joi.string(),
        careerLevel: Joi.string(),
        expYears: Joi.number().min(0).max(10),
        jobTypes: Joi.array().items(Joi.string())
    });

    return schema.validate(interests)
}