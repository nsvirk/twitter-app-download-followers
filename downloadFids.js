    /**
    * @fileoverview    :  File to download followers ids and store them in database
    */

    //NPM PACKAGES
    const dotenv                = require('dotenv').config();
    const moment                = require('moment');

    //LOCAL FILES
    const Config                = require('./appConfig.js') ;
    const AppConfig             = new Config.keys() ;

    const TwitterApplication    = require('./twitter/applicationApi.js');
    const TwitterUsers          = require('./twitter/usersApi.js');
    const TwitterFollowers      = require('./twitter/followerApi.js');


    //Postgres
    const PgTwitterDb           = require('./db/pgTwitterDb.js');

    /**
    * ==========================================================================
    * @function         :   getRestartIntervalForFutureTime
    * @implements       :   Calculate Restart Interval from Future Unix Timstamp
    * ==========================================================================
    */
    const getRestartIntervalForFutureTime = async (restartTimestamp) => {

        let now             = moment().format('X');
        let restartInterval = (parseInt(restartTimestamp) - parseInt(now)) ;

        //console.log(AppConfig.hLine2);
            console.log('        * GET Restart Interval');
            console.log(AppConfig.hLine2);
            console.log('            + now                          : ' + now);
            console.log('            + restartTimestamp             : ' + restartTimestamp);
            console.log('            + restartInterval              : ' + restartInterval);
            console.log('            + Present Time                 : ' + moment().format("DD/MM/YYYY h:mm:ss A"));
            console.log('            + Restart Time                 : ' + moment(restartTimestamp * 1000).format("DD/MM/YYYY h:mm:ss A"));
            console.log(AppConfig.hLine2);

        return restartInterval ;
    }

    /**
    * ==========================================================================
    * @function         :   restartDownloadFollowersIdsInDatabase
    * @implements       :   Retry Download after Reset Time
    * ==========================================================================
    */
    const restartDownloadFollowersIdsInDatabase = async (userScreenName, restartTimestamp) => {

        let restartInterval    = await getRestartIntervalForFutureTime(restartTimestamp) ;
        let setTimeoutInterval = parseInt(restartInterval) * 1000;

            console.log('        * APP PAUSED 🤚🏼');
            console.log(AppConfig.hLine2);
            console.log('            + restartInterval              : ' + restartInterval );
            console.log('            + setTimeoutInterval           : ' + setTimeoutInterval );
            console.log('            + Present Time                 : ' + moment().format("DD/MM/YYYY h:mm:ss A"));
            console.log('            + Restart Time                 : ' + moment(restartTimestamp * 1000).format("DD/MM/YYYY h:mm:ss A"));
            console.log(AppConfig.hLine2);

        // runApp after the interval
        setTimeout(function(){
            //screenName, cursor updated globally
            console.log('        * APP RESTARTED 👍🏼');
            console.log(AppConfig.hLine2);
            console.log('            + Restart Time                : ' + moment().format("DD/MM/YYYY h:mm:ss A"));
            downloadFollowersIdsInDatabase(userScreenName) ;
        }, setTimeoutInterval );
    }

    /**
    * ==========================================================================
    * @function         :   downloadFollowersIdsInDatabase
    * @implements       :   Download Followers Ids and insert into database
                            Check if First time or Update and
                            runs accordingly
    * ==========================================================================
    */
    const downloadFollowersIdsInDatabase = async (userScreenName) => {

        console.log(AppConfig.hLine);
        console.log('    👉🏼 STARTED - DOWNLOAD TWITTER FOLLOWERS IDS IN DATABASE');
        console.log(AppConfig.hLine);

        //------- Common Variables  --------------------------------------------
        let result ;
        let params = {} ;
        let restartTimestamp ;

        //------- Set Initial params -------------------------------------------
        params.screen_name              = userScreenName ;
        params.count                    = 5000 ;
        //params.count                    = 10 ;
        params.stringify_ids            = true ;

        //------- Check Rate Limit Status and Assign to Params -----------------
        result = await assignRateLimitStatusToParams(params) ;
        //console.log(result);

        //------- Stop execution if Rate Limit Exceeded ------------------------
        // result.rate_limit.remaining = 0 ; //For debug
        if (result.rate_limit.remaining == 0)
            {
                console.log('        * STOPPED 👎🏻');
                console.log(AppConfig.hLine2);
                console.log('            + Rate Limit Exceeded [Remain : '+ result.rate_limit.remaining + ']');
                console.log('            + Try again after ' + result.rate_limit.reset_time);
                console.log(AppConfig.hLine2);

                // set to restart at rate limit reset time
                restartTimestamp        = result.rate_limit.reset ;

                await restartDownloadFollowersIdsInDatabase(userScreenName, restartTimestamp) ;
                return result;
            }

        //------- Assign cursor to params from database ------------------------
        await assignCursorToParams(params) ;


        //------- Decide activity to do ----------------------------------------
            console.log('        * DECIDE actvity to do based on cursor');
            console.log(AppConfig.hLine2);

        if          (params.cursor == 0) {
            console.log('            + Activity                      : Downloaded once, update new');
            console.log(AppConfig.hLine2);
            result = await downloadFollowersIdsInDatabaseUpdate(params)

        } else if   (params.cursor == -1) {
            console.log('            + Activity                      : First download, from start');
            console.log(AppConfig.hLine2);
            result = await downloadFollowersIdsInDatabaseFirstTime(params);

        } else if   (params.cursor > 0) {
            console.log('            + Activity                      : First download, from cursor');
            console.log(AppConfig.hLine2);
            result = await downloadFollowersIdsInDatabaseFirstTime(params);

        }

        console.log(AppConfig.hLine);
        console.log('    👌🏼 FINISHED - DOWNLOAD TWITTER FOLLOWERS IDS IN DATABASE ');
        console.log(AppConfig.hLine);

        // set to restart at app_restart_interval provided in appConfig.js

        let now                 = moment().format('X');
        restartTimestamp        = (parseInt(AppConfig.app_restart_interval) + parseInt(now) ) ;
        // console.log(now);
        // console.log(AppConfig.app_restart_interval);
        // console.log(restartTimestamp);
        // console.log(moment(restartTimestamp * 1000).format("DD/MM/YYYY h:mm:ss A"));
        await restartDownloadFollowersIdsInDatabase(userScreenName, restartTimestamp) ;

        return result;
    }

    /**
    * ==========================================================================
    * @function         :   assignRateLimitStatusToParams
    * @implements       :   Check Rate Limit Status and assign to params
    * ==========================================================================
    */
    const assignRateLimitStatusToParams = async (params) => {

        params.rate_limit               = {} ;

        //------- Get rate_limit_status ----------------------------------------
        console.log(AppConfig.hLine2);
        console.log('        * ASSIGN rate_limit_status to params');
        console.log(AppConfig.hLine2);
        let result      = await TwitterApplication.rateLimitStatusFollowerIds() ;
        //console.log(result);

        Object.assign(params.rate_limit, result) ;
        console.log('            + params.rate_limit.limit       : ' + params.rate_limit.limit);
        console.log('            + params.rate_limit.remaining   : ' + params.rate_limit.remaining);
        console.log('            + params.rate_limit.reset       : ' + params.rate_limit.reset);
        console.log('            + params.rate_limit.reset_time  : ' + params.rate_limit.reset_time);
        console.log(AppConfig.hLine2);

        //For Debug set to 1 -- In production comment out next 3 lines
        //params.rate_limit.remaining = 1 ;
        console.log('            + params.rate_limit.remaining   : ' + params.rate_limit.remaining + ' (DEBUG)');
        console.log(AppConfig.hLine2);

        //In case rate limit exceeded

        return params;
    }

    /**
    * ==========================================================================
    * @function         :   assignCursorToParams
    * @implements       :   Check Cursor and assign to params
    * ==========================================================================
    */
    const assignCursorToParams = async (params) => {

        console.log('        * ASSIGN cursors to param');
        console.log(AppConfig.hLine2);

        //------- Get cursors from database ------------------------------------
        result                   = await PgTwitterDb.pgSelectCursors(params.screen_name) ;
        //console.log(result);

        //------- Assign cursor ------------------------------------------------

        // No Rows
        if ( (result.rows.length === 0) || (result.rowCount == 0) ) {
            params.cursor = '-1' ;
        } else { // Rows found, Set curosor to value found
            params.cursor = result.rows[0].u_next_cursor ;
        }

        //------- Display ------------------------------------------------------
        console.log('            + params.screen_name            : ' + params.screen_name);
        console.log('            + params.cursor                 : ' + params.cursor);
        console.log(AppConfig.hLine2);

        return params;
    }

    /**
    * ==========================================================================
    * @function         :   downloadFollowersIdsInDatabaseFirstTime
    * @implements       :   Download Followers Ids and insert into database
                            Runs first time till all followers inserted
                            and next_cursor returns 0
    * ==========================================================================
    */
    const downloadFollowersIdsInDatabaseFirstTime = async (params) => {

        //------- Common Variables  --------------------------------------------
        let result ;
        let userScreenName ;
        let userNextCursor ;
        let userPresentCursor ;

        //------- Display Activity ---------------------------------------------
        console.log('        * DOWNLOAD followers_id FIRST TIME');
        console.log(AppConfig.hLine2);
        console.log('            + params.screen_name            : ' + params.screen_name);
        console.log('            + params.count                  : ' + params.count);
        console.log('            + params.stringify_ids          : ' + params.stringify_ids);
        console.log('            + params.cursor                 : ' + params.cursor);
        console.log('            + params.rate_limit.remaining   : ' + params.rate_limit.remaining);
        console.log(AppConfig.hLine2);


        //------- Download followersIds ----------------------------------------
        result                  = await insertFollowersIdsToDatabase(params) ;
        //console.log(result);

        //------- Update cursors in database -----------------------------------
        userPresentCursor       = params.cursor ;
        userNextCursor          = result.cursor ;
        userScreenName          = params.screen_name ;
        result                  = await updateCursorsToDatabase(userScreenName, userPresentCursor, userNextCursor) ;

        return  params;

    }

    /**
    * ==========================================================================
    * @function         :   downloadFollowersIdsInDatabaseUpdate
    * @implements       :   Update Followers Ids and insert into database
                            after First time run has alread inserted all
                            followers_ids once
    * ==========================================================================
    */
    const downloadFollowersIdsInDatabaseUpdate = async (params) => {

        //------- Common Variables  --------------------------------------------
        let result ;
        let actualRateLimitRemaining ;

        let resultFollowersCtTwitter;
        let resultFollowersCtDatabase;

        let followersCountTwitter ;
        let followersCountDatabase ;
        let newFollowersCount ;

        //------- Check Current Total Followers on Twitter ---------------------
        console.log('        * COMPARE followers_count');
        console.log(AppConfig.hLine2);

        // Add params as required for users/lookup api
        params.include_entities     = false ;
        params.tweet_mode           = false ;
        actualRateLimitRemaining    = params.rate_limit.remaining ;
        params.rate_limit.remaining = 1 ; // Run only once, else same count will be download

        resultFollowersCtTwitter    = await TwitterUsers.getUserslookup(params) ;
        followersCountTwitter       = resultFollowersCtTwitter.response.data[0].followers_count ;
        console.log('            + Followers on Twitter         : ' + followersCountTwitter);
        //console.log(followersCount);
        //console.log(resultUsersLookup.response.data);

        //------- Check Current Total Followers in Database --------------------
        resultFollowersCtDatabase   = await PgTwitterDb.pgFollowersIdsCt(params.screen_name) ;
        //console.log(resultFollowersCtDatabase.rows[0].count);
        followersCountDatabase      = resultFollowersCtDatabase.rows[0].count ;
        newFollowersCount           = (parseInt(followersCountTwitter) - parseInt(followersCountDatabase)) ;
        if (newFollowersCount < 1) { newFollowersCount = 0;}
        console.log('            + Followers in Database        : ' + followersCountDatabase);
        console.log('            + New Followers to download    : ' + newFollowersCount );
        console.log(AppConfig.hLine2);
        console.log('      Note  1. Min 500 followers would be downloaded, even if no new followers');
        console.log('      Note  2. Followers in Database may be more than on Twitter  ');
        console.log(AppConfig.hLine2);

        //------- Modify params before Update ----------------------------------
        //Set cursor to -1 to start at the begining
        params.cursor               = -1 ;

        //Download minimum 500 followers
        if (newFollowersCount < 500) {
            params.count                = 500 ;
        } else {
            params.count                = newFollowersCount;
        }


        //------- Download followersIds ----------------------------------------
        console.log('        * DOWNLOAD followers_ids UPDATE');
        console.log(AppConfig.hLine2);
        console.log('            + params.screen_name            : ' + params.screen_name);
        console.log('            + params.count                  : ' + params.count);
        console.log('            + params.stringify_ids          : ' + params.stringify_ids);
        console.log('            + params.cursor                 : ' + params.cursor);
        console.log('            + params.rate_limit.remaining   : ' + params.rate_limit.remaining);
        console.log(AppConfig.hLine2);

        //------- Download New Followers ---------------------------------------
        result                      = await insertFollowersIdsToDatabase(params) ;
        //console.log(result);

        //------- Modify params after Update -----------------------------------
        //Once new followers are downloaded, set cursor to 0 instead of next_cursor values
        params.rate_limit.remaining = actualRateLimitRemaining - 1;
        params.cursor               = 0;


        //------- Update cursors in database -----------------------------------
        userPresentCursor       = params.cursor ;
        userNextCursor          = result.cursor ;
        userScreenName          = params.screen_name ;
        result                  = await updateCursorsToDatabase(userScreenName, userPresentCursor, userNextCursor) ;

        // Delete params
        delete params.include_entities;
        delete params.tweet_mode ;

        return params;
    }

    /**
    * ==========================================================================
    * @function         :   insertFollowersIdsToDatabase
    * @implements       :   Download and Update Followers to database
    * ==========================================================================
    */
    const insertFollowersIdsToDatabase = async (params) => {

        let resultFollowers ;
        let followerIdsCount ;
        let followerIdStr ;
        let resultInsert ;
        let insertCount = 0;


        //------- Download followersIds ----------------------------------------
        resultFollowers = await TwitterFollowers.downloadFollowersIds(params);
        //console.log(resultFollowers);

        followerIdsCount = resultFollowers.total_count ;
        console.log('            + Total Download Count          : ' + followerIdsCount);
        console.log(AppConfig.hLine2);

        //------- Insert followersIds ------------------------------------------
        console.log('        * INSERT followers_ids INTO DATABASE');
        console.log(AppConfig.hLine2);

        for (i=0; i < followerIdsCount; i++) {
            followerIdStr = resultFollowers.ids[i] ;
            //console.log(followerIdStr);
            resultInsert = await PgTwitterDb.pgInsertFollowersIds(params.screen_name, followerIdStr);
            //console.log(resultInsert);
            //console.log(resultInsert.rowCount);
            insertCount = (parseInt(resultInsert.rowCount)  + insertCount) ;

        }

        console.log('            + Insert Count                  : ' + insertCount);
        console.log(AppConfig.hLine2);
        console.log('      Note  3. Insert Count may differ from New followers count');
        console.log(AppConfig.hLine2);

        params.cursor = resultFollowers.next_cursor_str ;

        return params ;

    }
    /**
    * ==========================================================================
    * @function         :   updateCursorsToDatabase
    * @implements       :   Update Cursor value to database
    * ==========================================================================
    */
    const updateCursorsToDatabase = async (userScreenName, userPresentCursor, userNextCursor) => {

        // console.log(__function);
        // console.log(__line);
        // console.log(userScreenName);
        // console.log(userPresentCursor);
        // console.log(userNextCursor);
        //
        // return ;

        let resultCursors ;
        let checkCursorSetInDb ;

        //------- Update cursors in database -----------------------------------
        console.log('        * UPDATE cursors');
        console.log(AppConfig.hLine2);
        console.log('            + Present Cursor                : ' + userPresentCursor);
        console.log('            + Next Cursor                   : ' + userNextCursor);
        resultCursors                   = await PgTwitterDb.pgUpdateCursors(userScreenName, userNextCursor);
        console.log(AppConfig.hLine2);

        //------- Get cursors from database ------------------------------------
        console.log('        * SELECT cursors');
        console.log(AppConfig.hLine2);
        //Get cursor value
        resultCursors                   = await PgTwitterDb.pgSelectCursors(userScreenName) ;
        // Check cursor value
        if (userNextCursor == resultCursors.rows[0].u_next_cursor) {
            checkCursorSetInDb = true ;
        } else {
            checkCursorSetInDb = false ;
        }
        //Display
        console.log('            + Next Cursor in DB            : ' + resultCursors.rows[0].u_next_cursor);
        console.log('            + Check cursor update in DB    : ' + checkCursorSetInDb);
        console.log(AppConfig.hLine2);

        return ;

    }


    /**
    * ==========================================================================
    * @function         :   displayFollowersIdsInDatabase
    * @implements       :   Display the followers ids in database
    * ==========================================================================
    */
    const displayFollowersIdsInDatabase = async () => {

        let sql     = `SELECT u_screen_name, COUNT(f_id_str) as count FROM followers_ids GROUP BY u_screen_name ORDER BY count DESC;` ;
        let result  =  await PgTwitterDb.pgQuery(sql) ;
        let rowCt = result.rowCount ;

            console.log('        * DISPLAY Followers IDs in Database');
            console.log(AppConfig.hLine2);
            console.log('              u_screen_name \t \t count') ;
            console.log('          --------------------    -----------------');
        for (let i=0; i < rowCt; i++) {
            console.log('           ' + (i + 1) + '\t ' + result.rows[i].u_screen_name + ' \t \t ' + result.rows[i].count);
        }
            console.log(AppConfig.hLine2);

    }



    /**
    * ==========================================================================
    *  Module Exports
    * ==========================================================================
    **/

    module.exports = {

        downloadFollowersIdsInDatabase,
        displayFollowersIdsInDatabase

    }
