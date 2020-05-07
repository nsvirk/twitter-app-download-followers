    /**
    * @fileoverview    :   Helper for accessing Twitter Application API endpoint
    */

    const Twit          = require('./twitHelper.js');
    const moment        = require('moment');


    /**
    * ----------------------------------------------------------------------
    * @function         :   verifyCredentials
    * @implements       :   Verify Twitter Developer Credentials from Accounts API
    * ----------------------------------------------------------------------
    * @param            :   include_entities         optional
    * @param            :   skip_status              optional
    * @param            :   include_email            optional
    * @return           :   return object
    * @documentation    :   https://developer.twitter.com/en/docs/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
    * ----------------------------------------------------------------------
    */
    const verifyCredentials = async function (params) {
        const   path        = 'account/verify_credentials';
        //        params      = { include_entities: false, skip_status: true, include_email: true };
        let     response    = await Twit.get(path, params);
        return  response;
    }

    /**
    * ======================================================================
    * @function         :   runAccountApiTest
    * @implements       :   Testing of functions in this file
    * ======================================================================
    */
    const runAccountApiTest = async () => {

        let result ;
        let params = {} ;

        console.log('========================================================');
        console.log(' START OF TEST : runAccountApiTest()' );
        console.log('========================================================');

        params      = { include_entities: false, skip_status: true, include_email: true };
        result  = await verifyCredentials(params) ;
        console.log(result.response.data);

        console.log('========================================================');
        console.log(' END OF TEST : runAccountApiTest()' );
        console.log('========================================================');

    }

    /**
    * ==========================================================================
    *  Module Exports
    * ==========================================================================
    **/

    module.exports = {
        verifyCredentials,
        runAccountApiTest
    }
