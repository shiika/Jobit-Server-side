const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
let jobId = null;

module.exports = {
    postJob: function (token, job, next) {
        pool.beginTransaction((err) => {
            if (err) return next(err, null);

            try {
                const payload = jwt.verify(token, config.get("jwtPrivateKey"));
                const userType = payload.userType;
                if (userType != "employer") {
                    return next("Unauthorized", null);
                }

                pool.query(`
                    SELECT ID FROM job_types WHERE type_name = ?
                    `,
                    job.type,
                    (err, typeId) => {
                        if (err) return pool.rollback(() => next(err, null));

                        const jobRecord = {
                            experience_needed: job.experience,
                            salary: job.salary,
                            publish_date: job.publishDate,
                            description: job.description,
                            title: job.title,
                            vacancies: job.vacancies,
                            expire_date: job.expireDate,
                            employer_id: payload.ID,
                            type_id: typeId[0]["ID"]
                        };

                        pool.query(`
                        INSERT INTO job SET ?
                    `,
                            jobRecord,
                            (err, results) => {
                                if (err) return next(err, null);
                                jobId = results["insertId"];
                        });

                        pool.query(
                            `SELECT skill_name FROM skills`,
                            (err, results) => {
                                if (err) return pool.rollback(() => next(err, null));
                                const resultsSkills = results.map((item) => {
                                    return item.skill_name
                                });
                                const skills = job.skills.filter((item) => {
                                    return !resultsSkills.some((skill) => {
                                        return item === skill
                                    })
                                }).map(item => [item]);
                                if (skills.length > 0) {
                                    pool.query(
                                        `INSERT INTO skills(skill_name) VALUES ?`,
                                        [skills],
                                        (err, results) => {
                                            if (err) return pool.rollback(() => next(err, null));
                                            pool.query(
                                                `INSERT INTO job_skills SELECT ?, ID FROM skills WHERE skill_name in (${job.skills.map((item) => `"${item}"`).toString()})`,
                                                [jobId],
                                                (err, results) => {
                                                    if (err) return pool.rollback(() => next(err, null));
                                                    pool.commit((err) => {
                                                        if (err) return pool.rollback(() => next(err, null));
                                                    });
                                                }
                                            )
                                        }
                                    );

                                } else {
                                    pool.query(
                                        `INSERT INTO job_skills SELECT ?, ID FROM skills WHERE skill_name in (${job.skills.map((item) => `"${item}"`).toString()})`,
                                        [jobId],
                                        (err, results) => {
                                            if (err) return pool.rollback(() => next(err, null));
                                            pool.commit((err) => {
                                                if (err) return pool.rollback(() => next(err, null));

                                                return next(null, "Job has been posted successfully")
                                            });
                                        }
                                    );
                                }
                            }
                        );

                    });

            } catch (err) {
                return next("Invalid token. Please verify your credentials")
            }
        })
    },

    getEmployees: function(userId, next) {
        pool.query(`
        SELECT js.ID, js.first_name, js.last_name, js.image_url, r.role_name, ci.min_salary
        FROM job_seeker js
        JOIN seeker_role sr
            ON sr.seeker_id = js.ID
        JOIN roles r
            ON r.ID = sr.role_id
        JOIN career_interests ci
            ON ci.seeker_id = js.ID
        `,
        [userId, userId],
        (err, info) => {
            if (err) return next(err, null);
            let newInfo = info.filter((seeker, si) => {
                if (seeker.ID === info[info.length - 1].ID && si == 0) {
                    return seeker
                }
                if (si === info.length - 1) {
                    return seeker.ID !== info[0].ID
                } 
                return seeker.ID !== info[si + 1].ID;
            });
            
            return next(null, newInfo)
        })
    },

    getJobs: function(title, userId, next) {
        pool.beginTransaction(err => {
            if (err) return next(err, null);

            pool.query(`
            SELECT j.ID, j.experience_needed, j.salary, j.description, j.vacancies, j.publish_date, j.title, c.name as companyName, c.logo, jt.type_name
            FROM job j
            JOIN employer e
                ON e.ID = j.employer_id
            JOIN company c
                ON c.ID = e.company_id
			JOIN job_types jt
				ON jt.ID = j.type_id
            `, (err, jobs) => {
                if (err) return pool.rollback(() => next(err, null));

                    pool.commit(err => {
                        if (err) return pool.rollback(() => next(err, null));

                        return next(null, jobs)
                    })
            })

        })
    },

    getSkills: function(jobId, next) {
        pool.beginTransaction(err => {
            if (err) return next(err, null);

            pool.query(`
            SELECT s.skill_name
            FROM skills s
            JOIN job_skills js
                ON s.ID = js.skill_id
            JOIN job j
                ON j.ID = js.job_id
                AND j.ID = ?
            `,
            [jobId], 
            (err, skills) => {
                if (err) return pool.rollback(() => next(err, null));
                    if (err) return pool.rollback(() => next(err, null));

                    pool.commit(err => {
                        if (err) return pool.rollback(() => next(err, null));
                        const newSkills = skills.map(item => item["skill_name"])

                        return next(null, newSkills)
                    })
            })

        })
    },
}