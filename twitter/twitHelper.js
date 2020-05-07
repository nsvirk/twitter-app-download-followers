    /**
     * @fileoverview    :   Helper for 'twit' npm package
     */

    const dotenv          = require('dotenv').config();
    const Twit            = require('twit');

    const Twitter         = new Twit({
        consumer_key:         process.env.consumer_key ,
        consumer_secret:      process.env.consumer_secret,
        access_token:         process.env.access_token,
        access_token_secret:  process.env.access_token_secret
    });


    /**
    * ----------------------------------------------------------------------
    * @function        :   get
    * ----------------------------------------------------------------------
    * @param           :   path        required
    * @param           :   params      required
    * @return          :   result
    * ----------------------------------------------------------------------
    */
    const get = async (path, params) => {

        let     result          = {} ;
                result.params   = params ;

        try {
            let response        = await Twitter.get(path, params);
                result.response = response;

        } catch (error) {
                result.error    = error ;
                console.log(error);

        } finally {
                return result ;

        }
    }

    /**
    * ----------------------------------------------------------------------
    * @function        :   post
    * ----------------------------------------------------------------------
    * @param           :   path        required
    * @param           :   params      required
    * @return          :   result
    * ----------------------------------------------------------------------
    */
    const post = async (path, params) => {

        let     result          = {} ;
                result.params   = params ;

        try {
            let response        = await Twitter.post(path, params);
                result.response = response;

        } catch (error) {
                result.error    = error ;
                console.log(error);

        } finally {
                return result ;

        }
    }

    /**
    * ==========================================================================
    *  Module Exports
    * ==========================================================================
    **/

    module.exports = {
        get,
        post
    }
