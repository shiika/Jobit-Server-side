SELECT js.first_name, js.last_name, l.name, sl.level
FROM job_seeker js
JOIN seeker_langs sl
	ON js.ID = 7
    AND js.ID = sl.seeker_id
LEFT JOIN languages l
	ON l.ID = sl.lang_id