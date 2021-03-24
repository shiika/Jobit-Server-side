const connection = require("../db");

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
    }
}