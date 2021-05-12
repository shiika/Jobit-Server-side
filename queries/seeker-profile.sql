SELECT js.first_name, js.last_name, js.email, js.location, js.image_url, js.military_status, js.marital_status, js.gender, js.birth_date, sp.phone_num, r.role_name
FROM job_seeker js
JOIN seeker_role sr
	ON sr.seeker_id = js.ID
    AND js.ID = 7
JOIN roles r
	ON r.ID = sr.role_id
JOIN seeker_phone sp
	ON sp.seeker_id = 7
limit 1