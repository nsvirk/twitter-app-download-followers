-- Table Definition ----------------------------------------------

DROP TABLE cursors ;

CREATE TABLE cursors (
    id SERIAL PRIMARY KEY,
    u_screen_name text UNIQUE,
    u_next_cursor text,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_on timestamp with time zone
);
