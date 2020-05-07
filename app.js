    /**
    * @fileoverview    :   App Main file
    */
    //NODE PACKAGES
    const http                  = require('http');

    //NPM PACKAGES
    const dotenv                = require('dotenv').config();
    const moment                = require('moment');

    //LOCAL FILES
    const Config                = require('./appConfig.js') ;
    const AppConfig             = new Config.keys() ;

    const TwitterAccount        = require('./twitter/accountApi.js');
    const TwitterApplication    = require('./twitter/applicationApi.js');
    const TwitterUsers          = require('./twitter/usersApi.js');
    const TwitterFollowers      = require('./twitter/followerApi.js');

    //Postgres
    const PgTwitterDb           = require('./db/pgTwitterDb.js');

    //Others
    const DownloadFids          = require('./downloadFids.js');

    /**
    * ==========================================================================
    * @function         :   http.createServer
    * @implements       :   Create a simple server for app to run
    * ==========================================================================
    */
    let server = http.createServer((req, res) => {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Twitter app message new followers is online!\n');
    });


    /**
    * ==========================================================================
    * @function         :   appDisplayCredentials
    * @implements       :   For testing
    * ==========================================================================
    */
    const appDisplayCredentials = async () => {

        let params      = { include_entities: false, skip_status: true, include_email: true };
        let result      = await TwitterAccount.verifyCredentials(params) ;

        let data        = result.response.data;

        console.log(AppConfig.hLine);
        console.log('        * VERIFY Twitter Credentials');
        console.log(AppConfig.hLine2);
        console.log('            + id_str                       : ' + data.id_str );
        console.log('            + name                         : ' + data.name );
        console.log('            + screen_name                  : ' + data.screen_name );
        //console.log('            + description                  : ' + data.description );
        console.log('            + location                     : ' + data.location );
        console.log('            + followers_count              : ' + data.followers_count );
        console.log('            + friends_count                : ' + data.friends_count );
        console.log('            + created_at                   : ' + data.created_at );
        console.log(AppConfig.hLine);

    }

    /**
    * ==========================================================================
    * @function         :   appMain
    * @implements       :   Main App run function
    * ==========================================================================
    */
    const appMain = async () => {

        //Display Twitter Credentials
        await appDisplayCredentials() ;

        //Download followers
        let userScreenName ;
        userScreenName      = AppConfig.target_screen_name ;

        await DownloadFids.downloadFollowersIdsInDatabase(userScreenName) ;

        await DownloadFids.displayFollowersIdsInDatabase();

    }

    appMain();

    /**
    * ==========================================================================
    * @function         :   appTest
    * @implements       :   For testing
    * ==========================================================================
    */
    const appTest = async () => {

        //await TwitterAccount.runAccountApiTest() ;


    }
    //appTest();

    /**
    * ==========================================================================
    * @function         :   server.listen
    * @implements       :   Node Server Listen
    * ==========================================================================
    */

    server.listen(AppConfig.port);
