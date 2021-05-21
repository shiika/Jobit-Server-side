const pool = require("../db");
const jwt = require("jsonwebtoken");
const config = require("config");
let seekerId;

module.exports = {
    checkEmail: function(email, next) {
        pool.query(
            `SELECT email FROM job_seeker 
            WHERE email = ?`,
            email,
            next
            )
    },

    checkPhone: function(phone, next) {
        pool.query(
            `SELECT phone_num 
            FROM seeker_phone
            WHERE phone_num = ?`,
            phone,
            next)
    },

    getTitles: function(next) {
        pool.query(
            `SELECT role_name FROM roles`,
            next
            )
    },

    updateSeeker: function(seeker,userId, phone, next) {

        pool.query(
            `UPDATE job_seeker SET first_name = ?, last_name = ?, location = ?, marital_status = ?, military_status = ?, image_url = ? WHERE ID = ?`, 
            [seeker.first_name, seeker.last_name, seeker.location, seeker.marital_status, seeker.military_status, seeker.image_url, userId],
            (error, results) => {
                if (error) return next(error, null);

                pool.query(
                    `UPDATE seeker_phone SET phone_num = ? WHERE seeker_id = ?`,
                    [phone, userId],
                    (err, results) => {
                        if (err) return next(err, null);

                        return next(null, results);
                    })
            }
        )
    },
    createSeeker: function(seeker, phone, next) {

        pool.query(
            `INSERT INTO job_seeker SET ?`, 
            seeker,
            (error, results) => {
                if (error) return next(error, null);

                seekerId = results.insertId;
                pool.query(
                    "INSERT INTO seeker_phone SET seeker_id = ?, phone_num = ?", 
                    [seekerId, phone],
                    next
                    )
            }
        )
    },

    updateInterests: function(interests, userId, next) {
        pool.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            pool.query(
                `UPDATE career_interests SET min_salary = ?, expYears = ?, educationLevel = ?, status = ?,
                    level_id = (SELECT ID FROM career_level WHERE level_name = ?), seeker_id = ?
                    WHERE seeker_id = ?`,
                [interests.min_salary, interests.expYears, interests.educationLevel, interests.status, interests.careerLevel, userId, userId],
                (queryErr, results) => {
                    if (queryErr) {
                        return pool.rollback(() => next(queryErr, null))
                    }

                    pool.commit((commitErr) => {
                        if (commitErr) return next(commitErr, null);
                        console.log("Committed Successfully");
                        return next(null, results)
                    })
                }
            );
        });

    },
    getInterests: function(userId, next) {
        pool.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            pool.query(
                `SELECT ci.min_salary, cl.level_name, ci.expYears, ci.educationLevel, ci.status
                FROM career_interests ci
                JOIN career_level cl
                    ON cl.ID = ci.level_id
                    AND ci.seeker_id = ?`,
                [userId],
                (queryErr, interests) => {
                    if (queryErr) {
                        return pool.rollback(() => next(queryErr, null))
                    }
                    pool.query(`
                    SELECT type_name FROM job_types
                    JOIN seeker_types
                        ON seeker_types.type_id = job_types.ID
                        AND seeker_types.seeker_id = ?
                    `, [userId], (err, jobTypes) => {
                        if (err) return next(err, null);
                        
                        pool.commit((commitErr) => {
                            if (commitErr) return next(commitErr, null);
                            console.log("Committed Successfully");
                            return next(null, {types: Object.values(jobTypes.map(item => item.type_name)), interests: interests[0]})
                        })
                    })
                }
            );
        });

    },

    addInterests: function(interests, next) {
        pool.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            pool.query(
                `INSERT INTO career_interests SET min_salary = ?, expYears = ?, educationLevel = ?, status = ?,
                    level_id = (SELECT ID FROM career_level WHERE level_name = ?), seeker_id = ?`,
                [interests.min_salary, interests.expYears, interests.educationLevel, interests.status, interests.careerLevel, seekerId],
                (queryErr, results) => {
                    if (queryErr) {
                        return pool.rollback(() => next(queryErr, null))
                    }
                    let newTypes = interests.jobTypes.map((item) => `"${item}"`).toString();
                    pool.query(
                        `INSERT INTO seeker_types SELECT ?, ID FROM job_types WHERE type_name in (${newTypes})`,
                        [seekerId],
                        (err, results) => {
                            if (err) return next(err, null);
                            pool.commit((commitErr) => {
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
        pool.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            // Adding job-seeker roles
            pool.query(
                `SELECT role_name FROM roles`,
                (err, results) => {
                    if (err) return pool.rollback(() => next(err, null));
                    const resultsRoles = results.map((item) => { return item.role_name });
                    const roles = info.jobTitles.filter((item) => {
                        return !resultsRoles.some((role) => { return item === role })
                    }).map(item => [item]);
                    if (roles.length > 0) {
                        pool.query(
                            `INSERT INTO roles(role_name) VALUES ?`,
                            [roles],
                            (err, results) => {
                                if (err) return pool.rollback(() => next(err, null));
                                pool.query(
                                    `INSERT INTO seeker_role SELECT ?, ID FROM roles WHERE role_name in (${info.jobTitles.map((item) => `"${item}"`).toString()})`,
                                    [seekerId],
                                    (err, results) => {
                                        if (err) return pool.rollback(() => next(err, null));
                                        pool.commit((err) => {
                                            if (err) return pool.rollback(() => next(err, null));
                                        });
                                    }
                                )
                            }
                        );
                    }
                    else {
                        pool.query(
                            `INSERT INTO seeker_role SELECT ?, ID FROM roles WHERE role_name in (${info.jobTitles.map((item) => `"${item}"`).toString()})`,
                            [seekerId],
                            (err, results) => {
                                if (err) return pool.rollback(() => next(err, null));
                                pool.commit((err) => {
                                    if (err) return pool.rollback(() => next(err, null));
                                });
                            }
                        );
                    }
                }
            );
        });

        pool.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            // Adding job-seeker skills
            pool.query(
                `SELECT skill_name FROM skills`,
                (err, results) => {
                    if (err) return pool.rollback(() => next(err, null));
                    const resultsSkills = results.map((item) => { return item.skill_name });
                    const skills = info.skills.filter((item) => {
                        return !resultsSkills.some((skill) => { return item === skill })
                    }).map(item => [item]);
                    if (skills.length > 0) {
                            pool.query(
                                `INSERT INTO skills(skill_name) VALUES ?`,
                                [skills],
                                (err, results) => {
                                    if (err) return pool.rollback(() => next(err, null));
                                    pool.query(
                                        `INSERT INTO seeker_skills SELECT ?, ID FROM skills WHERE skill_name in (${info.skills.map((item) => `"${item}"`).toString()})`,
                                        [seekerId],
                                        (err, results) => {
                                            if (err) return pool.rollback(() => next(err, null));
                                            pool.commit((err) => {
                                                if (err) return pool.rollback(() => next(err, null));
                                            });
                                        }
                                    )
                                }
                            );

                    }
                    else {
                        pool.query(
                            `INSERT INTO seeker_skills SELECT ?, ID FROM skills WHERE skill_name in (${info.skills.map((item) => `"${item}"`).toString()})`,
                            [seekerId],
                            (err, results) => {
                                if (err) return pool.rollback(() => next(err, null));
                                pool.commit((err) => {
                                    if (err) return pool.rollback(() => next(err, null));
                                });
                            }
                        );
                    }
                }
            );
        });

        // Adding job-seeker languages
        pool.beginTransaction((transErr) => {
            if (transErr) return next(transErr, null);

            pool.query(
                `SELECT * FROM languages`,
                (err, langsResults) => {
                    if (err) return pool.rollback(() => next(err, null));
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

                    pool.query(
                        `INSERT INTO seeker_langs VALUES ?`,
                        [langsRows],
                        (err, results) => {
                            if (err) return pool.rollback(() => next(err, null));
                            pool.commit(() => {
                                if (err) return pool.rollback(() => next(err, null));
                            })
                        }
                    )
                }
            )

        });

        // Adding job-seeker qualification
        pool.query(
            `INSERT INTO job_qualification SET degree_level = ?, institution = ?, field_of_study = ?, start_date = ?, end_date = ?, graduation_grade = ?, seeker_id = ?`,
            [...Object.values(info.qualification), seekerId],
            (err, results) => {
                if (err) return next(err, null);

                return next(null, results)
            }
        )
    },

    getSeeker: function(userId, next) {

        pool.query(`
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
        pool.query(`
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
        pool.query(`
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

    addExp: function(userId, exp, next) {
        pool.query(`
            INSERT INTO work_experience SET ?
        `,
        { salary: exp.salary, company_name: exp.companyName, job_title: exp.title, job_type: exp.jobType, start_date: exp.startDate, end_date: exp.end_date, seeker_id: userId },
        (err, results) => {
            if (err) return next(err, null);

            return next(null, results)
        })
    },

    getExp: function(userId, next) {
        pool.query(` SELECT ID, salary, company_name, job_type, job_title, start_date, end_date
        FROM work_experience WHERE seeker_id = ? `,
        [userId],
        (err, results) => {
            if (err) return next(err, null);

            return next(null, results);
        })
    },

    removeExp: function(id, next) {
        pool.query(` DELETE FROM work_experience WHERE ID = ? `,
        [id],
        (err, results) => {
            if (err) return next(err, null);

            return next(null, results);
        })
    },
    addEdu: function(userId, edu, next) {
        pool.query(`
            INSERT INTO job_qualification SET ?
        `,
        {degree_level: edu.degreeLevel, institution: edu.institution, field_of_study: edu.fieldOfStudy, start_date: edu.startDate, end_date: edu.endDate, graduation_grade: edu.grade, seeker_id: userId},
        (err, results) => {
            if (err) return next(err, null);

            return next(null, results)
        })
    },

    getEdu: function(userId, next) {
        pool.query(` SELECT degree_level, institution, field_of_study, graduation_grade, start_date, end_date
        FROM job_qualification WHERE seeker_id = ? `,
        [userId],
        (err, results) => {
            if (err) return next(err, null);

            return next(null, results);
        })
    }
};