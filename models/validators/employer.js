const Joi = require("joi");

module.exports = function(user) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        title: Joi.string().required(),
        department: Joi.string().required(),
        phone: Joi.string().min(11),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(8),
        companyForm: Joi.object({
            name: Joi.string().required(),
            website: Joi.string().required(),
            locations: Joi.array().items(Joi.string()).min(1)
        })
    });

    return schema.validate(user)
}