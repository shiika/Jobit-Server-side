SELECT js.first_name, js.last_name, s.skill_name
FROM job_seeker js
JOIN seeker_skills ss
	ON js.ID = 7
    AND js.ID = ss.seeker_id
LEFT JOIN skills s
	ON s.ID = ss.skill_id
LIMIT 4