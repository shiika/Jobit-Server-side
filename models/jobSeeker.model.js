const connection = require("../db");
const jwt = require("jsonwebtoken");
const config = require("config");
let seekerId = 7;

module.exports = {
    checkEmail: function(email, next) {
        connection.query(
            `SELECT email FROM job_seeker 
            WHERE email = ?`,
            email,
            next
            )
    },

    checkPhone: function(phone, next) {
        connection.query(
            `SELECT phone_num 
            FROM seeker_phone
            WHERE phone_num = ?`,
            phone,
            next)
    },

    getTitles: function(next) {
        connection.query(
            `SELECT role_name FROM roles`,
            next
            )
    },

    createSeeker: function(seeker, phone, next) {

        connection.query(
            `INSERT INTO job_seeker SET ?`, 
            seeker,
            (error, results) => {
                if (error) return next(error, null);

                seekerId = results.insertId;
                connection.query(
                    "INSERT INTO seeker_phone SET seeker_id = ?, phone_num = ?", 
                    [seekerId, phone],
                    next
                    )
            }
        )
    },

    addInterests: function(interests, next) {
        connection.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            connection.query(
                `INSERT INTO career_interests SET min_salary = ?, expYears = ?, educationLevel = ?, status = ?,
                    level_id = (SELECT ID FROM career_level WHERE level_name = ?), seeker_id = ?`,
                [interests.min_salary, interests.expYears, interests.educationLevel, interests.status, interests.careerLevel, seekerId],
                (queryErr, results) => {
                    if (queryErr) {
                        return connection.rollback(() => next(queryErr, null))
                    }
                    let newTypes = interests.jobTypes.map((item) => `"${item}"`).toString();
                    connection.query(
                        `INSERT INTO seeker_types SELECT ?, ID FROM job_types WHERE type_name in (${newTypes})`,
                        [seekerId],
                        (err, results) => {
                            if (err) return next(err, null);
                            connection.commit((commitErr) => {
                                if (commitErr) return next(commitErr, null);
                                console.log("Committed Successfully");
                                return next(null, results)
                            })
                        })
                }
            );
        });

    },

    addProfInfo: function(info, next) {
        connection.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            // Adding job-seeker roles
            connection.query(
                `SELECT role_name FROM roles`,
                (err, results) => {
                    if (err) return connection.rollback(() => next(err, null));
                    const resultsRoles = results.map((item) => { return item.role_name });
                    const roles = info.jobTitles.filter((item) => {
                        return !resultsRoles.some((role) => { return item === role })
                    }).map(item => [item]);
                    if (roles.length > 0) {
                        connection.query(
                            `INSERT INTO roles(role_name) VALUES ?`,
                            [roles],
                            (err, results) => {
                                if (err) return connection.rollback(() => next(err, null));
                                connection.query(
                                    `INSERT INTO seeker_role SELECT ?, ID FROM roles WHERE role_name in (${info.jobTitles.map((item) => `"${item}"`).toString()})`,
                                    [seekerId],
                                    (err, results) => {
                                        if (err) return connection.rollback(() => next(err, null));
                                        connection.commit((err) => {
                                            if (err) return connection.rollback(() => next(err, null));
                                        });
                                    }
                                )
                            }
                        );
                    }
                    else {
                        connection.query(
                            `INSERT INTO seeker_role SELECT ?, ID FROM roles WHERE role_name in (${info.jobTitles.map((item) => `"${item}"`).toString()})`,
                            [seekerId],
                            (err, results) => {
                                if (err) return connection.rollback(() => next(err, null));
                                connection.commit((err) => {
                                    if (err) return connection.rollback(() => next(err, null));
                                });
                            }
                        );
                    }
                }
            );
        });

        connection.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            // Adding job-seeker skills
            connection.query(
                `SELECT skill_name FROM skills`,
                (err, results) => {
                    if (err) return connection.rollback(() => next(err, null));
                    const resultsSkills = results.map((item) => { return item.skill_name });
                    const skills = info.skills.filter((item) => {
                        return !resultsSkills.some((skill) => { return item === skill })
                    }).map(item => [item]);
                    if (skills.length > 0) {
                            connection.query(
                                `INSERT INTO skills(skill_name) VALUES ?`,
                                [skills],
                                (err, results) => {
                                    if (err) return connection.rollback(() => next(err, null));
                                    connection.query(
                                        `INSERT INTO seeker_skills SELECT ?, ID FROM skills WHERE skill_name in (${info.skills.map((item) => `"${item}"`).toString()})`,
                                        [seekerId],
                                        (err, results) => {
                                            if (err) return connection.rollback(() => next(err, null));
                                            connection.commit((err) => {
                                                if (err) return connection.rollback(() => next(err, null));
                                            });
                                        }
                                    )
                                }
                            );

                    }
                    else {
                        connection.query(
                            `INSERT INTO seeker_skills SELECT ?, ID FROM skills WHERE skill_name in (${info.skills.map((item) => `"${item}"`).toString()})`,
                            [seekerId],
                            (err, results) => {
                                if (err) return connection.rollback(() => next(err, null));
                                connection.commit((err) => {
                                    if (err) return connection.rollback(() => next(err, null));
                                });
                            }
                        );
                    }
                }
            );
        });

        // Adding job-seeker languages
        connection.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            connection.query(
                `SELECT * FROM languages`,
                (err, langsResults) => {
                    if (err) return connection.rollback(() => next(err, null));
                    const langs = langsResults.filter(item => {
                        return info.langs.some(lang => item.name === lang.name);
                    });
                    const langsRows = langs.map(lang => {
                        const level = info.langs.find(item => item.name === lang.name).proficiency;
                        lang.level = level;
                        const {name, ...newLang} = lang;
                        const finalLang = Object.values(newLang);
                        finalLang.unshift(seekerId);
                        return finalLang
                    });

                    connection.query(
                        `INSERT INTO seeker_langs VALUES ?`,
                        [langsRows],
                        (err, results) => {
                            if (err) return connection.rollback(() => next(err, null));
                            connection.commit(() => {
                                if (err) return connection.rollback(() => next(err, null));
                            })
                        }
                    )
                }
            )

        });

        // Adding job-seeker qualification
        connection.query(
            `INSERT INTO job_qualification SET degree_level = ?, institution = ?, field_of_study = ?, start_date = ?, end_date = ?, graduation_grade = ?, seeker_id = ?`,
            [...Object.values(info.qualification), seekerId],
            (err, results) => {
                if (err) return next(err, null);

                return next(null, results)
            }
        )
    },

    getSeeker: function(userId, next) {

        connection.query(`
        SELECT js.first_name, js.last_name, js.email, js.location, js.image_url, js.military_status, js.marital_status, js.gender, js.birth_date, sp.phone_num, r.role_name
        FROM job_seeker js
        JOIN seeker_role sr
            ON sr.seeker_id = js.ID
            AND js.ID = ?
        JOIN roles r
            ON r.ID = sr.role_id
        JOIN seeker_phone sp
            ON sp.seeker_id = ?
        limit 1
        `,
        [userId, userId],
        (err, results) => {
            if (err) return next(err, null);
            return next(null, results[0])
        })
    },
    getSkills: function(userId, next) {
        connection.query(`
        SELECT s.skill_name
        FROM job_seeker js
        JOIN seeker_skills ss
            ON js.ID = ?
            AND js.ID = ss.seeker_id
        LEFT JOIN skills s
            ON s.ID = ss.skill_id
        LIMIT 4
        `,
        [userId],
        (err, results) => {
            if (err) return next(err, null);
            const skills = results.map((item, index) => {
                return item["skill_name"]
            })
            return next(null, skills)
        })
    },

    getLangs: function(userId, next) {
        connection.query(`
        SELECT l.name, sl.level
        FROM job_seeker js
        JOIN seeker_langs sl
            ON js.ID = ?
            AND js.ID = sl.seeker_id
        LEFT JOIN languages l
            ON l.ID = sl.lang_id
        `,
        [userId],
        (err, results) => {
            if (err) return next(err, null);
            return next(null, results)
        })
    },
};