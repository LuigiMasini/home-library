-- migrate:up
ALTER TABLE books ADD COLUMN cover CHAR(255);
--set a cover for every book,
--this will only result in some 404
--and will be fixed on book edit -> save
UPDATE books SET cover=CONCAT("/uploads/", id, ".jpg");


-- migrate:down
ALTER TABLE books DROP COLUMN cover;
