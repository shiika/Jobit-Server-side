const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = {
    createEmployer: function(empInfo, next) {
        pool.query(
            `SELECT * FROM company`,
            (err, results) => {
                if (err) return next(err, null);
                
                const newCompany = results.find(result => result.name === empInfo.companyForm.name);
                if (!newCompany) {
                    pool.query(
                        `INSERT INTO company SET name = ?, website = ?, logo = ?`,
                        [empInfo.companyForm.name, empInfo.companyForm.website, empInfo.companyForm.logo],
                        (err, results) => {
                            if (err) return next(err, null);
                            
                            const {companyForm, firstName, lastName, ...emp} = empInfo;
                            const empRecord = {
                                ...emp,
                                company_id: results.insertId,
                                first_name: empInfo.firstName,
                                last_name: empInfo.lastName,
                            };
                            const locationRec = empInfo.companyForm.locations.map(item => {
                                return `(${results.insertId},${item})`
                            });

                                pool.query(
                                    `INSERT INTO company_locations VALUES ${locationRec.join(",")}`,
                                    (err, results) => {
                                        if (err) return next(err, null);
                                    }
                                );

                                pool.query(
                                    `INSERT INTO employer SET ?`,
                                    empRecord,
                                    (err, results) => {
                                        if (err) return next(err, null);

                                            return next(null, results)
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
                        pool.query(
                            `INSERT INTO employer SET ?`,
                            empRecord,
                            (err, results) => {
                                    if (err) return next(err, null);
    
                                    return next(null, results)
                            }
                        )
                    }

                    
                }
            )
    },

    authUser: function(credentials, userType, next) {
        pool.query(
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
    },
    
    getLocations: function(next) {
        pool.query(`SELECT * FROM locations`,
        (err, results) => {
            if (err) return next(err, null);
            return next(null, results)
        })
    }
}