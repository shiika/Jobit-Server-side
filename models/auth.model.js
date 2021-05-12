const connection = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = {
    createEmployer: function(empInfo, next) {
        connection.beginTransaction((err) => {
            if (err) return next(err, null);

            connection.query(
                `SELECT * FROM company`,
                (err, results) => {
                    if (err) return next(err, null);

                    const newCompany = results.find(result => result.name === empInfo.companyForm.name);
                    if (!newCompany) {
                        connection.query(
                            `INSERT INTO company SET name = ?, website = ?`,
                            [empInfo.companyForm.name, empInfo.companyForm.website],
                            (err, results) => {
                                if (err) return next(err, null);

                                const {companyForm, firstName, lastName, ...emp} = empInfo;
                                const empRecord = {
                                    ...emp,
                                    company_id: results.insertId,
                                    first_name: empInfo.firstName,
                                    last_name: empInfo.lastName,
                                };

                                connection.query(
                                    `INSERT INTO employer SET ?`,
                                    empRecord,
                                    (err, results) => {
                                        if (err) return next(err, null);

                                        connection.commit((err) => {
                                            if (err) return next(err, null);

                                            return next(null, results)
                                        })
                                    }
                                )
                            }
                        )
                    } else {
                        const {companyForm, firstName, lastName, ...emp} = empInfo;
                        const empRecord = {
                            ...emp,
                            company_id: newCompany.ID,
                            first_name: empInfo.firstName,
                            last_name: empInfo.lastName,
                        };
                        connection.query(
                            `INSERT INTO employer SET ?`,
                            empRecord,
                            (err, results) => {
                                if (err) return next(err, null);
    
                                connection.commit((err) => {
                                    if (err) return next(err, null);
    
                                    return next(null, results)
                                })
                            }
                        )
                    }

                    
                }
            )
        })
    },

    authUser: function(credentials, userType, next) {
        connection.query(
            `SELECT ID, first_name, email, password FROM ${userType} WHERE email = ?`,
            [credentials.email],
            (err, results) => {
                if (err) return next(err, null);

                if (results.length == 0) return next("Email doesn't exist");
                    bcrypt.compare(credentials.password, results[0].password)
                        .then(isMatch => {
                            if (isMatch) {
                                const token = jwt.sign({...results[0], userType}, config.get("jwtPrivateKey"), { expiresIn: "1h" });
                                return next(null, {token, userId: results[0].ID})
                            } else {
                                return next("Wrong password. Check your password again", null);
                            }
                        })
                        .catch(
                            err => {
                                return next(err, null);
                            }
                        )

            }
        )
    }
}