    /**
     * @fileoverview    :   Helper for accessing Twitter users API
     */

    const Twit                  = require('./twitHelper.js');

    //LOCAL FILES
    const Config                = require('../appConfig.js') ;
    const AppConfig             = new Config.keys() ;
    /**
    * ----------------------------------------------------------------------
    * @function        :   getUserslookup
    * @endpoint        :   GET users/lookup    Rate Limit : 900
    * ----------------------------------------------------------------------
    * @param           :   Name                 Required        Default Value
    * @param           :   user_id              optional
    * @param           :   screen_name          optional
    * @param           :   include_entities     optional
    * @param           :   tweet_mode           optional
    * @return          :   response.data
    * @documentation   :   https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
    * ----------------------------------------------------------------------
    */
    const getUserslookup = async (params) => {

        //Supply only the required params and remove rest
        params.user_id              = params.user_id ;
        params.screen_name          = params.screen_name ;
        params.include_entities     = params.include_entities ;
        params.tweet_mode           = params.tweet_mode ;

        let path            = 'users/lookup';
        let result          = await Twit.get(path, params);

        return result ;

    }

    /**
    * ======================================================================
    * @function         :   runUsersApiTest
    * @implements       :   Testing of Followers Class
    * ======================================================================
    */
    const runUsersApiTest = async () => {

        let params                  = {} ;
        let display                 = {} ;

        params.user_id              = '' ;
        params.screen_name          = 'github,salesforce' ;
        params.include_entities     = false ;
        params.tweet_mode           = false ;

        let result                  = await getUserslookup(params) ;

        console.log(AppConfig.hLine);
        console.log('API TEST START - Users API' );
        console.log(AppConfig.hLine);

        console.log(AppConfig.hLine2);
        console.log('    => getUserslookup(params.screen_name="github,salesforce")' );
        console.log(AppConfig.hLine2);

        display.id_str              = result.response.data[0].id_str ;
        display.screen_name         = result.response.data[0].screen_name ;
        display.name                = result.response.data[0].name ;
        display.location            = result.response.data[0].location ;
        display.followers_count     = result.response.data[0].followers_count ;
        display.friends_count       = result.response.data[0].friends_count ;
        console.table(display);

        display.id_str              = result.response.data[1].id_str ;
        display.screen_name         = result.response.data[1].screen_name ;
        display.name                = result.response.data[1].name ;
        display.followers_count     = result.response.data[1].followers_count ;
        display.friends_count       = result.response.data[1].friends_count ;
        console.table(display);

        console.log(AppConfig.hLine);
        console.log('API TEST END - Users API' );
        console.log(AppConfig.hLine);




    }
    /**
    * ==========================================================================
    *  Module Exports
    * ==========================================================================
    **/

    module.exports = {
        getUserslookup,
        runUsersApiTest
    }
