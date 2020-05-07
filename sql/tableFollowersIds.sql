-- Table Definition ----------------------------------------------
DROP TABLE IF EXISTS followers_ids ;

CREATE TABLE followers_ids (

    -- incrementing id
    id SERIAL PRIMARY KEY,

    -- twitter user whose follower
    u_screen_name text,

    -- followers id
    f_id_str text,

    -- row information
    created_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP INDEX IF EXISTS public."followers_ids_u_screen_name_f_id_str";

CREATE INDEX followers_ids_u_screen_name_f_id_str ON followers_ids(u_screen_name text_ops,f_id_str text_ops);
