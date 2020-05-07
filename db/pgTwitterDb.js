    /**
    * @fileoverview    :   Custom pg db functions for twitter_db
    */

    const Pg            = require('./pgConnection.js');

    /**
    * ----------------------------------------------------------------------
    * @function        :   pgTablesList
    * ----------------------------------------------------------------------
    * @param           :   none
    * @return          :   return object
    * ----------------------------------------------------------------------
    */
    const pgTablesList = async () => {
        let sql = `SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';` ;
        let result = await Pg.pool.query(sql);
        //console.log(result);
        return result.rows ;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   pgTruncateTable
    * ----------------------------------------------------------------------
    * @param           :   tableName          required
    * @return          :   return object
    * ----------------------------------------------------------------------
    */
    const pgTruncateTable = async (tableName) => {
        let sql         = `TRUNCATE TABLE ${tableName} RESTART IDENTITY` ;
        let result      = await Pg.pool.query(sql);
        return result ;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   pgQuery
    * ----------------------------------------------------------------------
    * @param           :   sql              required
    * @return          :   return object
    * ----------------------------------------------------------------------
    */
    const pgQuery = async (sql) => {
        let result = await Pg.pool.query(sql);
        return result ;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   pgInsertFollowerId
    * @implements      :   Insert unique userScreenName and followerIdStr combinations
    * ----------------------------------------------------------------------
    * @param           :   userScreenName          required
    * @param           :   followerId              required
    * @return          :   return object
    * ----------------------------------------------------------------------
    */
    const pgInsertFollowersIds = async (userScreenName, followerIdStr) => {

        let sql = `INSERT INTO followers_ids
                        (u_screen_name, f_id_str)
                    SELECT '${userScreenName}', '${followerIdStr}'
                    WHERE
                        NOT EXISTS (
                            SELECT id FROM followers_ids WHERE u_screen_name='${userScreenName}' AND f_id_str='${followerIdStr}'
                        );`;

        let result = await Pg.pool.query(sql);
        return result ;

    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   pgUpdateCursors
    * @implements      :   Update next cursor for user
    * ----------------------------------------------------------------------
    * @param           :   userScreenName          required
    * @param           :   userNextCursor              required
    * @return          :   return object
    * ----------------------------------------------------------------------
    */
    const pgUpdateCursors = async (userScreenName, userNextCursor) => {

        let sql =   `INSERT INTO cursors
                            (u_screen_name, u_next_cursor)
                    VALUES
                            ('${userScreenName}', '${userNextCursor}')
                    ON CONFLICT
                            (u_screen_name)
                    DO
                            UPDATE SET u_next_cursor='${userNextCursor}', updated_on=NOW() ;
                    `;

        let result = await Pg.pool.query(sql);
        return result ;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   pgSelectCursors
    * @implements      :   pgSelectCursors next cursor for user
    * ----------------------------------------------------------------------
    * @param           :   userScreenName          required
    * @return          :   return object
    * ----------------------------------------------------------------------
    */
    const pgSelectCursors = async (userScreenName) => {

        let sql =   `SELECT
                            u_screen_name, u_next_cursor
                    FROM
                            cursors
                    WHERE
                            u_screen_name='${userScreenName}' ;
                    `;

        let result = await Pg.pool.query(sql);
        return result ;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   pgFollowersIdsCt
    * @implements      :   Counts followers for user
    * ----------------------------------------------------------------------
    * @param           :   userScreenName          required
    * @return          :   return object
    * ----------------------------------------------------------------------
    */
    const pgFollowersIdsCt = async (userScreenName) => {

        let sql =   `SELECT COUNT (f_id_str) FROM followers_ids WHERE u_screen_name='${userScreenName}' ; `;
        let result = await Pg.pool.query(sql);
        return result ;
    }


    /**
    * ==========================================================================
    * @function         :   pgTestPoolConnection
    * @implements       :   Test the pg pool connection
    * ==========================================================================
    */

    const pgTestPoolConnection = async () => {

        console.log('-----------------------------------------------------------');
        console.log('START OF TEST');
        console.log('-----------------------------------------------------------');
        console.log('    => pool.query()');
        console.log('-----------------------------------------------------------');

        const result = await Pg.pool.query('SELECT NOW()');

        console.log(result);
        console.log('-----------------------------------------------------------');
        console.log('    => pool.end()')
        console.log('-----------------------------------------------------------');

        await Pg.pool.end() ;

        console.log('END OF TEST');
        console.log('-----------------------------------------------------------');
    }


    /**
    * ==========================================================================
    * @function         :   pgTestInsertFollowersIds
    * @implements       :   Test the function pgInsertFollowersIds
    * ==========================================================================
    */

    const pgTestInsertFollowersIds = async () => {

        let result ;

        let userScreenName      = 'github' ;
        let followeridStr       = '123456' ;

        console.log('-----------------------------------------------------------');
        console.log(`Inserting into followers_id values ${userScreenName} and ${followeridStr}`);
        result                  = await pgInsertFollowersIds(userScreenName, followeridStr ) ;
        console.log('-----------------------------------------------------------');
        console.table(result.rowCount);
        console.log('-----------------------------------------------------------');
        console.log(`Inserting again into followers_id values ${userScreenName} and ${followeridStr}`);
        result                  = await pgInsertFollowersIds(userScreenName, followeridStr ) ;
        console.log('-----------------------------------------------------------');
        console.table(result.rowCount);
        console.log('-----------------------------------------------------------');
        let sql = `SELECT * FROM followers_ids WHERE u_screen_name='${userScreenName}' AND f_id_str='${followeridStr}';` ;
        console.log('Running Sql => ' + sql );
        console.log('-----------------------------------------------------------');
        result                  = await pgQuery(sql) ;
        console.log('-----------------------------------------------------------');
        console.table(result.rows);
        console.log('-----------------------------------------------------------');

        return ;

    }

    /**
    * ==========================================================================
    * @function         :   pgTestUpdateCursors
    * @implements       :   Test the function pgUpdateCursors
    * ==========================================================================
    */
    const pgTestUpdateCursors = async () => {

        let result ;
        let userScreenName  ;
        let userNextCursor ;

        userScreenName = 'github' ;

        console.log('-----------------------------------------------------------');

        userNextCursor = '1' ;
        result = await pgUpdateCursors(userScreenName, userNextCursor);
        console.table(result);
        console.log('-----------------------------------------------------------');

        userNextCursor = '2' ;
        result = await pgUpdateCursors(userScreenName, userNextCursor);
        console.table(result);
        console.log('-----------------------------------------------------------');

        userNextCursor = '3' ;
        result = await pgUpdateCursors(userScreenName, userNextCursor);
        console.table(result);
        console.log('-----------------------------------------------------------');

        let sql = `SELECT * FROM cursors WHERE u_screen_name='${userScreenName}';` ;
        console.log('Running Sql => ' + sql );
        console.log('-----------------------------------------------------------');
        result                  = await pgQuery(sql) ;
        console.log('-----------------------------------------------------------');
        console.table(result.rows);
        console.log('-----------------------------------------------------------');

        return ;

    }

    /**
    * ==========================================================================
    *  Module Exports
    * ==========================================================================
    **/

    module.exports = {
        pgTablesList,
        pgTruncateTable,
        pgQuery,

        pgInsertFollowersIds,
        pgUpdateCursors,
        pgSelectCursors,

        pgFollowersIdsCt,

        pgTestPoolConnection,
        pgTestInsertFollowersIds,
        pgTestUpdateCursors
    }
