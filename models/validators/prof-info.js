const Joi = require("joi");

module.exports = function(user) {
    const schema = Joi.object({
        jobTitles: Joi.array().items(Joi.string()),
        skills: Joi.array().items(Joi.string()),
        langs: Joi.array().items(Joi.object({ name: Joi.string(), proficiency: Joi.string() })),
        qualification: Joi.object({
            degreeLevel: Joi.string(),
            institution: Joi.string(),
            fieldOfStudy: Joi.string(),
            startDate: Joi.date(),
            endDate: Joi.date(),
            gradGrade: Joi.string().max(1)
        })
    });

    return schema.validate(user)
}