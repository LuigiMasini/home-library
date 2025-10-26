-- migrate:up
ALTER TABLE books MODIFY COLUMN publish_year SMALLINT;

-- migrate:down
ALTER TABLE books MODIFY COLUMN publish_year YEAR;
