const Joi = require("joi");

module.exports = function(user) {
    const schema = Joi.object({
        gender: Joi.string().required(),
        birth_date: Joi.date().required(),
        phone: Joi.string().min(11),
        image_url: Joi.string(),
        email: Joi.string().email().required(),
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