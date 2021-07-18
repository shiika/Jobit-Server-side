const pool = require("../db");
const bcrypt = require('bcrypt');

module.exports = {
    mockPost: function(empInfo, next) {
        pool.query(
            `SELECT * FROM company`,
            async (err, results) => {
                if (err) return next(err, null);

                const newCompany = results.find(result => result.name === empInfo.name);
                if (!newCompany) {
                    const website = `www.${empInfo.name}.com`;
                    pool.query(
                        `INSERT INTO company SET name = ?, website = ?, logo = ?`,
                        [empInfo.name, website, empInfo.logo],
                        async (err, results) => {
                            if (err) return next(err, null);

                            const {name, logo, ...emp} = empInfo;
                            const hashed = await bcrypt.hash(`${empInfo.first_name}666666`, 10);
                            emp.password = hashed;
                            const empRecord = {
                                ...emp,
                                company_id: results.insertId,
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
                    )
                } else {
                    const {name, logo, ...emp} = empInfo;
                    const hashed = await bcrypt.hash(`${empInfo.first_name}666666`, 10);
                    emp.password = hashed;
                    const empRecord = {
                        ...emp,
                        company_id: newCompany.ID,
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
    }
}