const pool = require("../db");
const jwt = require("jsonwebtoken");
const config = require("config");
let jobId;

module.exports = {
    postJob: function (token, job, next) {

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
                    if (err) return next(err, null);

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
                            if (err) return next(err, null);
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
                                        if (err) return next(err, null);
                                        pool.query(
                                            `INSERT INTO job_skills SELECT ?, ID FROM skills WHERE skill_name in (${job.skills.map((item) => `"${item}"`).toString()})`,
                                            [jobId],
                                            (err, results) => {
                                                if (err) return next(err, null);
                                            }
                                        )
                                    }
                                );

                            } else {
                                pool.query(
                                    `INSERT INTO job_skills SELECT ?, ID FROM skills WHERE skill_name in (${job.skills.map((item) => `"${item}"`).toString()})`,
                                    [jobId],
                                    (err, results) => {
                                        if (err) return next(err, null);

                                        return next(null, "Job has been posted successfully")
                                    }
                                );
                            }
                        }
                    );

                });

        } catch (err) {
            return next("Invalid token. Please verify your credentials")
        }
    },
    applyForJob: function (jobId, seekerId, date, next) {
        pool.query(`
            INSERT INTO applying_status SET job_id = ?, seeker_id = ?, status_id = 5, state_date = ?
        `,
            [jobId, seekerId, date],
            (err, results) => {
                if (err) return next(err, null);

                return next(null, results);
            })
    },
    getEmployerJob: function (empId, next) {
        pool.query(`
        SELECT j.ID, j.experience_needed, j.salary, j.description, j.vacancies, j.publish_date, j.title, c.name as companyName, c.logo, jt.type_name
            FROM job j
            JOIN employer e
                ON e.ID = j.employer_id
                AND j.employer_id = ?
            JOIN company c
                ON c.ID = e.company_id
			JOIN job_types jt
				ON jt.ID = j.type_id
        `,
            [empId],
            (err, jobs) => {
                if (err) return next(err, null);

                return next(null, jobs)
            })
    }
}