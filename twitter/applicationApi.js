    /**
    * @fileoverview    :   Helper for accessing Twitter Application API endpoint
    */

    const Twit          = require('./twitHelper.js');
    const moment        = require('moment');

     /**
     * ----------------------------------------------------------------------
     * @function        :   rateLimitStatus
     * ----------------------------------------------------------------------
     * @param           :   resources       required
     * @param           :   key             required
     * @return          :   result
     * @documentation   :   https://developer.twitter.com/en/docs/developer-utilities/rate-limit-status/api-reference/get-application-rate_limit_status
     * ----------------------------------------------------------------------
     */
    const rateLimitStatus = async function (resource, key) {
        const path              = 'application/rate_limit_status';
        let params              = { resources: resource};
        let result              = await Twit.get(path, params);
        let resultResources     = result.response.data.resources ;
        let status ;
        //console.log(resultResources);

        if (resource) {
            Object.keys(resultResources).forEach( (item) => {
                //console.log(item);
                if (item == resource) {
                    let value = resultResources[item] ;
                    Object.keys(value).forEach( (item1) => {
                        if (item1 == key) {
                            status = value[item1] ;

                            if (status) {
                                status.reset_time = moment(status.reset * 1000).format("DD/MM/YYYY h:mm:ss A") ;
                                //if      (status.remaining > 0)  { status.allowed = true  ; }
                                //else                            { status.allowed = false ; }
                            }

                            //console.log(status);
                        }
                    })
                }
            });

        } else {
            status = resultResources ;
        }
        return status;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   rateLimitStatusOfAResource
    * ----------------------------------------------------------------------
    * @param           :   resources        required
    * @param           :   key              required
    * @return          :   return object =>  limit: 15, remaining: 15, reset: 1588347940
    * @documentation   :   https://developer.twitter.com/en/docs/developer-utilities/rate-limit-status/api-reference/get-application-rate_limit_status
    * ----------------------------------------------------------------------
    */
    const rateLimitStatusOfAResource = async (resource, key) => {
        let status          = await rateLimitStatus(resource,key) ;
        return status;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   rateLimitStatusOfAllResources
    * ----------------------------------------------------------------------
    * @param           :   resources        required
    * @param           :   key              required
    * @return          :   return object =>  limit: 15, remaining: 15, reset: 1588347940
    * @documentation   :   https://developer.twitter.com/en/docs/developer-utilities/rate-limit-status/api-reference/get-application-rate_limit_status
    * ----------------------------------------------------------------------
    */
    const rateLimitStatusOfAllResources = async () => {
        let status          = await rateLimitStatus() ;
        return status;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   rateLimitStatusFollowerIds
    * ----------------------------------------------------------------------
    * @param           :   resources        required
    * @param           :   key              required
    * @return          :   return object =>  limit: 15, remaining: 15, reset: 1588347940
    * @documentation   :   https://developer.twitter.com/en/docs/developer-utilities/rate-limit-status/api-reference/get-application-rate_limit_status
    * ----------------------------------------------------------------------
    */
    const rateLimitStatusFollowerIds = async () => {
        const resources     = 'followers' ;
        const key           = '/followers/ids' ;
        let status          = await rateLimitStatus(resources,key) ;
        return status;
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   rateLimitStatusFollowerIds
    * ----------------------------------------------------------------------
    * @param           :   resources        required
    * @param           :   key              required
    * @return          :   return object =>  limit: 15, remaining: 15, reset: 1588347940
    * @documentation   :   https://developer.twitter.com/en/docs/developer-utilities/rate-limit-status/api-reference/get-application-rate_limit_status
    * ----------------------------------------------------------------------
    */
    const rateLimitStatusFollowerList = async () => {
        const resources  = 'followers' ;
        const key   = '/followers/list' ;
        let status          = await rateLimitStatus(resources,key) ;
        return status;
    }

        /**
    * ----------------------------------------------------------------------
    * @function        :   rateLimitStatusDirectMessagesSent
    * ----------------------------------------------------------------------
    * @param           :   resources        required
    * @param           :   key              required
    * @return          :   return object =>  limit: 300, remaining: 300, reset: 1588347940
    * @documentation   :   https://developer.twitter.com/en/docs/developer-utilities/rate-limit-status/api-reference/get-application-rate_limit_status
    * ----------------------------------------------------------------------
    */
    const rateLimitStatusDirectMessagesSent = async () => {
        const resources  = 'direct_messages' ;
        const key   = '/direct_messages/sent' ;
        let status          = await rateLimitStatus(resources,key) ;
        return status;
    }

    /**
    * ======================================================================
    * @function         :   runRateLimitTest
    * @implements       :   Testing of function in this file
    * ======================================================================
    */
    const runApplicationApiRateLimitTest = async () => {

        console.log('========================================================');
        console.log(' START OF TEST : runApplicationApiRateLimitTest()' );
        console.log('========================================================');

        console.log('========================================================');
        console.log('        * rateLimitStatusOfAllResources()');
        console.log('========================================================');
        let rateLimitStatusOfAllResourcesResult         = await rateLimitStatusOfAllResources() ;
        console.log(rateLimitStatusOfAllResourcesResult);

        console.log('========================================================');
        console.log('        * rateLimitStatusFollowerIds()' );
        console.log('========================================================');
        let rlStatusFollowerIds         = await rateLimitStatusFollowerIds() ;
        console.log(rlStatusFollowerIds);

        console.log('========================================================');
        console.log('        * rateLimitStatusFollowerList()');
        console.log('========================================================');
        let rlStatusFollowerList        = await rateLimitStatusFollowerList() ;
        console.log(rlStatusFollowerList);

        console.log('========================================================');
        console.log('        * rateLimitStatusDirectMessagesSent()');
        console.log('========================================================');
        let rlStatusDirectMessagesSent  = await rateLimitStatusDirectMessagesSent() ;
        console.log(rlStatusDirectMessagesSent);

        console.log('========================================================');
        console.log('        * rateLimitStatusOfAResource()');
        console.log('========================================================');
        let resource                                = 'application' ;
        let key                                     = '/application/rate_limit_status' ;
        console.log('            + Resource : ' + resource);
        console.log('            + Key      : ' + key);
        console.log('========================================================');
        let rateLimitStatusOfAResourceResult    = await rateLimitStatusOfAResource(resource, key) ;
        console.log(rateLimitStatusOfAResourceResult);

        console.log('========================================================');
        console.log(' END OF TEST : runApplicationApiRateLimitTest()' );
        console.log('========================================================');

    }

    /**
    * ==========================================================================
    *  Module Exports
    * ==========================================================================
    **/

    module.exports = {
        rateLimitStatusOfAResource,
        rateLimitStatusOfAllResources,

        rateLimitStatusFollowerIds,
        rateLimitStatusFollowerList,
        rateLimitStatusDirectMessagesSent,

        runApplicationApiRateLimitTest
    }
