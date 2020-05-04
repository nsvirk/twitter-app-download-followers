//NODE PACKAGES
let http            = require('http');

//NPM PACKAGES
let dotenv          = require('dotenv').config();
let moment          = require('moment');

//LOCAL FILES
let Config          = require('./appConfig.js') ;
let AppConfig       = new Config.keys() ;

let TwitWrapper     = require('./twitWrapper.js');

const hLine         = AppConfig.hLine ;
const hLine2        = AppConfig.hLine2 ;


/*******************************
// LOGGING
 *******************************/
    const debug = AppConfig.debug ;

    function log(message) {
      if (debug) {
        console.log(message);
      }
    }

/*******************************
// CREATE A SIMPLE SERVER
 *******************************/
    let server = http.createServer((req, res) => {
        // Set a response type of plain text for the response
        res.writeHead(200, {'Content-Type': 'text/plain'});

        // Send back a response and end the connection
        res.end('Twitter app message new followers is online!\n');
    });

/*******************************
// APP MAIN
*******************************/
    /***************************************************************************
    // Verify Credentials onStart
     **************************************************************************/
    const verifyCredentials = async () => {
        const credentials = await TwitWrapper.verifyCredentials() ;
            //set GLOBAL VARIABLES
            AppConfig.myTwitterScreenName = credentials.screen_name;
            AppConfig.myTwitterName       = credentials.name;
            AppConfig.myTwitterId         = credentials.id;
            AppConfig.myTwitterIdStr      = credentials.id_str;
            AppConfig.myTwitterFollowersCt= credentials.followers_count;
            AppConfig.myTwitterFriendsCt  = credentials.friends_count;
            console.log(AppConfig.hLine2);
            console.log('GET account/verify_credentials');
            console.log(AppConfig.hLine2);
            console.log('       twitter user : ' + AppConfig.myTwitterName + ' (@' + AppConfig.myTwitterScreenName + ')' );
            console.log('         twitter id : ' + AppConfig.myTwitterIdStr );
            console.log('          followers : ' + AppConfig.myTwitterFollowersCt.toString());
            console.log('          following : ' + AppConfig.myTwitterFriendsCt.toString());
            console.log(hLine);

            myTwitterScreenName = credentials.screen_name ;
            myTwitterIdStr = credentials.id_str ;

            return;
    }
    //verifyCredentials() ;
    /***************************************************************************
    // Check Rate Limit Status
    // @ params : screenName
    // @ return : object {
    //                      status (True is limit remains or false if not)
    //                      remain (Remaining Limit)
    //                      reset  (Reset Timestamp)
    //                   }

     **************************************************************************/
     const checkRateLimitStatusFollowerIds = async (screenName) => {
         console.log(hLine2);
                 log('RUN => server.js => checkRateLimitStatusFollowerIds()');
         console.log('    => Check Twitter API Rate Limit Status for "followers/ids" ');
         console.log(hLine2);
         // Set Return
         let result = {} ;
         result.status = false ;

         //Check rate_limit_status
         let rateLimitStatusFollowerIds = await TwitWrapper.rateLimitStatusFollowerIds();
         let resetTimestamp             = rateLimitStatusFollowerIds.reset ;
         let remainingLimit             = rateLimitStatusFollowerIds.remaining ;
         result.reset                   = resetTimestamp ;
         result.remain                  = remainingLimit ;

         if (remainingLimit > 0) {
             console.log('        * CHECK Rate Limit Status');
             console.log('            + Remaining Limit       :\t' + remainingLimit);
             result.status = true ;
         } else {
             console.log('            + Limit Reset Time      :\t' + resetTimestamp);
             result.status = false ;
         }

         return result ;
     }
    /***************************************************************************
    // Set last_follower_id in datafile
     **************************************************************************/
     const setLastFollowerIdInDB = async (screenName, followersId) => {
         log(hLine2);
         log('RUN => server.js => setLastFollowerIdInDB()');
         log(hLine2);
         let result           = await LowDB.setLastFollowerId(screenName, followersId);
         //console.log(result);
         log('        * SET last_follower_id');
         log('            + screen_name            :\t' + result.screen_name);
         log('            + last_follower_id       :\t' + result.last_follower_id);
         return result;
     }

     /***************************************************************************
     // Get last_follower_id from datafile
      **************************************************************************/
      const getLastFollowerIdfromDB = async (screenName) => {
         log(hLine2);
         log(    'RUN => server.js => getLastFollowerIdfromDB()');
         log(hLine2);
         let result           = await LowDB.getLastFollowerId(screenName);
         //console.log(result);
         log(    '        * GET last_follower_id');
         if (!result) {
             //Nothing found
             log('            + screen_name           :\t' );
             log('            + last_follower_id      :\t' );

         } else {
             log('            + screen_name           :\t' + result.screen_name);
             log('            + last_follower_id      :\t' + result.last_follower_id);
         }

         return result;
     }

    /***************************************************************************
    // Get New Followers
    // @ params : screenName        ( Twitter handle for which to monitor)
    // @ result : array             ( Array of New Followers             )
     **************************************************************************/
    const getNewFollowerIds = async (screenName, lastFollowerId) => {
        console.log(hLine2);
                log('RUN => server.js => getNewFollowerIds()');
        console.log('    => Get New Followers from Twitter');
        console.log(hLine2);

        //Define Return Variable
        let newFollowerIds = [];

        let getCount            = AppConfig.get_followers_count ;
        let allFollowerIds      = await TwitWrapper.getFollowersIds(screenName, getCount);
        console.log('        * FROM Twitter API');
        console.log('            + All Follower IDs      :\t' + allFollowerIds.length);
        //console.log(allFollowerIds);

        if (allFollowerIds.length > 0) {
            //Discard all IDs after lastFollowerId
            let i = 0;
            while ((lastFollowerId != allFollowerIds[i]) && (i < 5001))
            {
                currentFollowerId   = allFollowerIds[i];
                newFollowerIds.push(currentFollowerId);
                i++;
            }
        }

        //console.log('        * FROM -> Twitter API \t New Followers:\t ' + newFollowerIds.length);
        //console.log(newFollowerIds);

        return newFollowerIds;
    }


    /***************************************************************************
    // Restart App after Interval
    // @ params : screenName
    // @ params : restartInterval   (In Seconds)
     **************************************************************************/
     const restartApp = async (screenName, restartInterval) => {

         log(hLine2);
         log('RUN => server.js => restartApp');
         log(hLine2);

         let now                = moment().format("x") ;
         let restartTime        = parseInt(now) + (parseInt(restartInterval) * 1000) ;
         let setTimeoutInterval = restartInterval * 1000;

         console.log('        * APP PAUSED');
         //console.log('        * Now              : ' + now);
         //console.log('        * Present TimeStamp: ' + now ) ;
         //console.log('        * Restart TimeStamp: ' + restartTime );
         console.log('            + Present Time           :\t' + moment().format("DD/MM/YYYY h:mm:ss A"));
         console.log('            + Restart Time           :\t' + moment(restartTime).format("DD/MM/YYYY h:mm:ss A"));
         console.log(hLine);

         // runApp after the interval
         setTimeout(function(){
             //screenName, cursor updated globally
             console.log('        * APP RESTARTED');
             //runTest() ;
             runApp(screenName);
         }, setTimeoutInterval );
     }

    /***************************************************************************
    // Run App at setInterval
     **************************************************************************/
     const runApp = async (screenName) => {

         console.log(hLine);
         console.log('🚀 TWITTER APP MESSAGE NEW FOLLOWERS STARTED' + ' [localhost:' + AppConfig.port +'] 🚀');
         console.log(hLine);

         console.log(hLine2);
                 log('RUN => server.js => runApp');
         console.log(hLine2);
         console.log('        * APP STARTED');

         //======== FUNCTION VARIABLES  ========================================
         let lastFollowerIdObj ;
         let lastFollowerId ;
         let restartInterval ;

         //======== Check if Rate Limimt Status allows =========================
         let checkRateLimitStatusFollowerIdsAllows = await checkRateLimitStatusFollowerIds(screenName) ;
         let rlStatus   = checkRateLimitStatusFollowerIdsAllows.status ;
         let rlRemains  = checkRateLimitStatusFollowerIdsAllows.remains ;
         let rlReset    = checkRateLimitStatusFollowerIdsAllows.reset ;

         if (rlStatus == false) {
             let now = moment().format('X');
             //console.log('now             : ' + now);
             //console.log('rlReset         : ' + rlReset);
             restartInterval = (parseInt(rlReset) - parseInt(now)) ;
             //console.log('restartInterval : ' + restartInterval);
             restartApp(screenName, restartInterval);
             return ;
         }

         //======== Check if Last Follower ID found in DB ======================
         let checkExistsLastFollowerIdInDB = await getLastFollowerIdfromDB(screenName) ;

         //======== Get Nth from Twitter & Set in DB if not found ==============
         if (!checkExistsLastFollowerIdInDB) {
             //Get from Twitter

             console.log(hLine2);
             console.log('            + "n"th Follower ID not in DB, get from Twitter');
             let nthFollowerId  = await getNthFollowerFromTwitter(screenName) ;
             // Set in DB
             console.log('            + Set "n"th Follower ID in DB');
             let setNthFollowerId       = await setNthFollowerAsLastFollowerInDB(screenName, nthFollowerId) ;
         }

         //======== Get Last Follower from DB ==================================
         console.log(hLine2);
         lastFollowerIdObj              = await getLastFollowerIdfromDB(screenName);
         //console.log(    '        * FROM -> DB           \t Screen Name     :\t' + lastFollowerIdObj.screen_name);
         //console.log(    '        * FROM -> DB           \t Last Follower ID:\t' + lastFollowerIdObj.last_follower_id);

         // //======== GET NEW FOLLOWERS ==========================================
         lastFollowerId = lastFollowerIdObj.last_follower_id ;
         let newFollowerIdsArr          = await getNewFollowerIds(screenName, lastFollowerId) ;
         console.log(    '            + New Follower IDs      :\t' + newFollowerIdsArr.length);
         //console.log(newFollowerIdsArr);


         //======== SET last_follower_id =======================================
         if (recipientsCt > 0) {
             let newLastFollowersId    = newFollowerIdsArr[0]; //The firstID of new followers
             let setlastFollowersId    = await setLastFollowerIdInDB(screenName, newLastFollowersId);
             console.log(hLine2);
             let getlastFollowersId    = await getLastFollowerIdfromDB(screenName);

             if (setlastFollowersId.last_follower_id == getlastFollowersId.last_follower_id ) {
                 log('            + Set in DB Check       :\tOK');
             }
         }

         //======== RESTART APP ================================================
         restartInterval = AppConfig.app_restart_interval; //
         restartApp(screenName, restartInterval) ;
     }

     //Start App Here
     let screenName = '';
     runApp(screenName);


     //=========================================================================
     const runTest = async () => {

     }

     //runTest();

/*******************************
// RUN SERVER
*******************************/
server.listen(AppConfig.port);
