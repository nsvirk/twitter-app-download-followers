    /**
     * @fileoverview    :   Helper for accessing Twitter Followers API
     */

    const Twit                  = require('./twitHelper.js');

    const Config                = require('../appConfig.js') ;
    const AppConfig             = new Config.keys() ;

    /**
    * ----------------------------------------------------------------------
    * @function        :   getFollowersIds
    * @endpoint        :   GET followers/ids    Rate Limit : 15
    * ----------------------------------------------------------------------
    * @param           :   Name                 Required        Default Value
    * @param           :   user_id              optional
    * @param           :   screen_name          optional
    * @param           :   cursor               optional        -1
    * @param           :   stringify_ids        optional        false
    * @param           :   count                optional
    * @return          :   response.data
    * @documentation   :   https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
    * ----------------------------------------------------------------------
    */
    const getFollowersIds = async (params) => {

        if (!params.cursor) { params.cursor  = -1;      };
        if (!params.count)  { params.count   = 5000;    };

        let path            = 'followers/ids';
        let result          = await Twit.get(path, params);
        if (result.response) {
            result.response.data.total_count =  result.response.data.ids.length ;
        }
        return result ;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   getFollowersList
    * @endpoint        :   GET followers/ids        Rate Limit : 15
    * ----------------------------------------------------------------------
    * @param           :   Name                     Required        Default Value
    * @param           :   user_id                  optional
    * @param           :   screen_name              optional
    * @param           :   cursor                   optional        -1
    * @param           :   count                    optional
    * @param           :   skip_status              optional        false
    * @param           :   include_user_entities    optional        true
    * @return          :   response.data
    * @documentation   :   https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-followers-list
    * =============================================================================
    */
    const getFollowersList = async (params) => {

        if (!params.cursor)                 { params.cursor                 = -1;       };
        if (!params.count)                  { params.count                  = 200;      };
        if (!params.skip_status)            { params.skip_status            = false;    };
        if (!params.include_user_entities)  { params.include_user_entities  = true;     };

        let path            = 'followers/list';
        let result          = await Twit.get(path, params);

        //Add additional information to response
        if (result.response) {
            result.response.data.total_count =  result.response.data.users.length ;
        }
        return result ;
    }

    /**
    * ----------------------------------------------------------------------
    * @function         :   downloadFollowersIds
    * @imlements        :   Downloads followers Ids
    * ----------------------------------------------------------------------
    * @param            :   Name                     Required        Default Value
    * @param            :   user_id                  optional
    * @param            :   screen_name              optional
    * @param            :   cursor                   optional        -1
    * @return           :   object
    * ----------------------------------------------------------------------
    */

    const downloadFollowersIds = async (params) => {
        /* ------------------------------------------------------------------ */
        let fnVars              = {log_display_switch: true} ;
        let result              = {ids: [], next_cursor_str: null, previous_cursor_str: null, total_count: 0, rate_limit: {} }
        let rateLimitRemain     = 0 ;
        let allFollowersIds     = [];
        let totalCount          = 0 ;

        /* ------------------------------------------------------------------ */
        const getFollowers = async (params) => {

            let resultObj               = {} ;
            let getResult               = await getFollowersIds(params) ;
            //console.log(getResult.response);

            let followersIds            = getResult.response.data.ids ;
            allFollowersIds             = allFollowersIds.concat(followersIds) ;

            result.ids                  = allFollowersIds ;
            result.next_cursor_str      = getResult.response.data.next_cursor_str ;
            result.previous_cursor_str  = getResult.response.data.previous_cursor_str ;
            let count                   = getResult.response.data.total_count ;
            totalCount                  = totalCount + parseInt(count) ;
            result.total_count          = totalCount ;
            result.rate_limit.remaining = result.rate_limit.remaining - 1 ;

            return ;
        }

        /* ------------------------------------------------------------------ */
        const displayRateLimitConsoleLog = async () => {

            if (fnVars.log_display_switch == true) {
                console.log('            + Rate Limit Remain             : ' + result.rate_limit.remaining  );
                console.log('            + Rate Limit Reset Time         : ' + result.rate_limit.reset_time );
                console.log('            + Next Cursor                   : ' + result.next_cursor_str       );
                console.log('            + Incremental Download Count    : ' + result.total_count           );
                console.log(AppConfig.hLine2);
            }

            if (result.next_cursor_str      == 0) { fnVars.log_display_switch = false ;}
            if (params.rate_limit.remaining == 0) { fnVars.log_display_switch = false ;}

        }
        /* ------------------------------------------------------------------ */
        const runFunction = async (params) => {

            //Check for proper params
            if ( (params.rate_limit == undefined) || (params.rate_limit.remaining == undefined) ) {
                let errorMessage = 'Error: params.rate_limit needs to be assigned.' ;
                throw errorMessage ;
                return ;
            }

            //Add rate_limit keys to result
            Object.assign(result.rate_limit, params.rate_limit) ;

            //If no rate limit, display and return
            if (result.rate_limit.remaining == 0) {
                await displayRateLimitConsoleLog() ;
                return ;
            }

            // if have rate limit, download followers, till reach end of followers (next_cursor = 0)
            for (let i =  result.rate_limit.remaining; i > 0 ; i--) {

                if (result.next_cursor_str != 0) {
                        await getFollowers(params) ;
                        //Update params
                        params.cursor               = result.next_cursor_str ;
                         ;
                        //Display
                        await displayRateLimitConsoleLog() ;

                } else {
                    //Display
                    await displayRateLimitConsoleLog() ;
                }
            }
        }

        await runFunction(params) ;

        return  result ;
        /* ------------------------------------------------------------------ */
    } // downloadFollowersIds


        /*
            //Sample Result
            {
              ids: ['332633104', '1188716774113439744'],
              next_cursor: 1657172065566574300,
              next_cursor_str: '1657172065566574238',
              previous_cursor: -1661469437318284000,
              previous_cursor_str: '-1661469437318284156',
              total_count: 15
            }
        */

    /**
    * ======================================================================
    * @function         :   runFollowersTest
    * @implements       :   Testing of Followers Class
    * ======================================================================
    */
    const runFollowersApiTest = async () => {

        let params              = {} ;
        params.screen_name      = 'github' ;
        params.count            = 50 ;
        params.stringify_ids    = true ;

        let followersIds        = await getFollowersIds(params) ;

        console.log('========================================================');
        console.log(' START OF TEST : runFollowersApiTest()' );
        console.log('========================================================');
        console.log('');
        console.log('========================================================');
        console.log('   function getFollowersIds(params)');
        console.log('========================================================');
        console.log('   * raw ');
        console.log('--------------------------------------------------------');
        console.log(followersIds);
        console.log('--------------------------------------------------------');
        console.log('   * followersIds.params ');
        console.log('--------------------------------------------------------');
        console.log(followersIds.params);
        console.log('--------------------------------------------------------');
        console.log('   * followersIds.response.data ');
        console.log('--------------------------------------------------------');
        console.log(followersIds.response.data);
        console.log('--------------------------------------------------------');
        console.log('   * followersIds.response.data.ids ');
        console.log('--------------------------------------------------------');
        console.log(followersIds.response.data.ids);
        console.log('--------------------------------------------------------');

        params.count            = 2 ;
        let followersList       = await getFollowersList(params) ;

        console.log('========================================================');
        console.log('   function getFollowersList(params)');
        console.log('========================================================');
        console.log('   * raw ');
        console.log('--------------------------------------------------------');
        console.log(followersList);
        console.log('--------------------------------------------------------');
        console.log('   * followersList.params ');
        console.log('--------------------------------------------------------');
        console.log(followersList.params);
        console.log('--------------------------------------------------------');
        console.log('   * followersList.response.data ');
        console.log('--------------------------------------------------------');
        console.log(followersList.response.data);
        console.log('--------------------------------------------------------');
        console.log('   * followersList.response.data.users ');
        console.log('--------------------------------------------------------');
        console.log(followersList.response.data.users);
        console.log('--------------------------------------------------------');

        params.count            = 5000 ;

        console.log('========================================================');
        console.log('   function downloadFollowersIds(params)');
        console.log('========================================================');
        console.log('   * raw ');
        console.log('--------------------------------------------------------');
        console.log('');
        console.log('========================================================');
        console.log(' END OF TEST   : runFollowersApiTest');
        console.log('========================================================');
        return ;
    }

    /**
    * ==========================================================================
    *  Module Exports
    * ==========================================================================
    **/

    module.exports = {
        getFollowersIds,
        getFollowersList,
        downloadFollowersIds,
        runFollowersApiTest
    }
