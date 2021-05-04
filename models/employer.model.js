const connection = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
let jobId = null;

module.exports = {
    postJob: function(token, job, next) {
        connection.beginTransaction((err) => {
            if (err) return next(err, null);

            try {
                const payload = jwt.verify(token, config.get("jwtPrivateKey"));

                    connection.query(`
                    SELECT ID FROM job_types WHERE type_name = ?
                    `,
                    job.type,
                    (err, typeId) => {
                    if (err) return connection.rollback(() => next(err, null));
    
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

                    connection.query(`
                        INSERT INTO job SET ?
                    `,
                    jobRecord,
                    (err, results) => {
                        if (err) return next(err, null);
                        jobId = results["insertId"];

                        connection.commit((err) => {
                            if (err) return next(err, null);

                            return next(null, results);
                        })
                    });

                    connection.query(
                        `SELECT skill_name FROM skills`,
                        (err, results) => {
                            if (err) return connection.rollback(() => next(err, null));
                            const resultsSkills = results.map((item) => { return item.skill_name });
                            const skills = job.skills.filter((item) => {
                                return !resultsSkills.some((skill) => { return item === skill })
                            }).map(item => [item]);
                            if (skills.length > 0) {
                                    connection.query(
                                        `INSERT INTO skills(skill_name) VALUES ?`,
                                        [skills],
                                        (err, results) => {
                                            if (err) return connection.rollback(() => next(err, null));
                                            connection.query(
                                                `INSERT INTO job_skills SELECT ?, ID FROM skills WHERE skill_name in (${job.skills.map((item) => `"${item}"`).toString()})`,
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
                                    `INSERT INTO job_skills SELECT ?, ID FROM skills WHERE skill_name in (${job.skills.map((item) => `"${item}"`).toString()})`,
                                    [jobId],
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

            } catch (err) {
                return next("Invalid token. Please verify your credentials")
            }
        })
    }
}