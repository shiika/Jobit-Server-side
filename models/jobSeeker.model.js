const connection = require("../db");

class JobSeeker {
    constructor() {}

    createSeeker(seeker, next) {
        this.gender = seeker.gender;
        this.birth_date = seeker.birth_date;
        this.email = seeker.email;
        this.password = seeker.password;
        this.cv = seeker.cv;
        this.marital_status = seeker.marital_status;
        this.military_status = seeker.military_status;
        this.first_name = seeker.first_name;
        this.last_name = seeker.last_name;
        this.location = seeker.location;
        this.age = seeker.age;

        connection.query(
            "INSERT INTO job_seeker SET ?", 
            this,
            next
        );
    }
}

module.exports = JobSeeker;