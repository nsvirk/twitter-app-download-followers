//NPM PACKAGES
let dotenv          = require('dotenv').config();
var Twit            = require('twit');

var Twitter = new Twit({
    consumer_key:         process.env.consumer_key ,
    consumer_secret:      process.env.consumer_secret,
    access_token:         process.env.access_token,
    access_token_secret:  process.env.access_token_secret
});

/********************************
// GET WRAPPER
 ********************************/
const get = async function (path, params) {
    try {
        let response = await Twitter.get(path, params);
        return response;
    }
    catch (error) { console.log(error); }
}

/********************************
// POST WRAPPER
 ********************************/
const post = async function (path, params) {
    try {
        let response = await Twitter.post(path, params);
        return response;
    }
    catch (error) {
        console.log(error);
    }
}

/********************************
//GET application/rate_limit_status
@ params : resources [optional, A comma-separated list of resource families you want to know the current rate limit disposition for e.g statuses,friends,trends,help]
https://developer.twitter.com/en/docs/developer-utilities/rate-limit-status/api-reference/get-application-rate_limit_status
 ********************************/
const rateLimitStatus = async function (resourceName, resourceKey) {
    try {
        const path      = 'application/rate_limit_status';
        let params      = { resources: resourceName};
        let response    = await Twitter.get(path, params);
        let resources   = response.data.resources ;
        let status      = {};

        Object.keys(resources).forEach( (item) => {
            if (item == resourceName) {
                let value = resources[item] ;
                Object.keys(value).forEach( (item1) => {
                    if (item1 == resourceKey) {
                        status = value[item1] ;
                        //console.log(status);
                    }
                })
            }
        });
        return status;
    }
    catch (error) { console.log(error); }
}

/*********************************/
const rateLimitStatusFollowerIds = async () => {
    try {
        const resourceName  = 'followers' ;
        const resourceKey   = '/followers/ids' ;
        let status          = await rateLimitStatus(resourceName,resourceKey) ;
        return status; // return object => { limit: 15, remaining: 15, reset: 1588347940 }
    }
    catch (error) { console.log(error); }
}

/*********************************/
const rateLimitStatusDmSent = async () => {
    try {
        const resourceName  = 'direct_messages' ;
        const resourceKey   = '/direct_messages/sent' ;
        let status          = await rateLimitStatus(resourceName,resourceKey) ;
        return status; // return object => { limit: 300, remaining: 300, reset: 1588347940 }
    }
    catch (error) { console.log(error); }
}

/********************************
//GET account/verify_credentials
@ params : include_entities [optional, The entities node will not be included when set to false]
@ params : skip_status      (optional, When set to either true , t or 1 statuses will not be included in the returned user object)
@ params : include_email    (optional, When set to true email will be returned in the user objects as a string. If the user does not have an email address on their account, or if the email address is not verified, null will be returned)
https://developer.twitter.com/en/docs/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
 ********************************/
const verifyCredentials = async function () {
    try {
        const path          = 'account/verify_credentials';
        let params          = { include_entities: false, skip_status: true, include_email: false };
        let response        = await Twitter.get(path, params);
        let credentials     = response.data ;
        return credentials;
    }
    catch (error) { console.log(error); }
}

/********************************
// GET followers/ids
// @ params : screen_name       [required, The screen name of the user for whom to return results]
// @ params : count             [required, Specifies the number of IDs attempt retrieval of, up to a maximum of 5,000 per distinct request]
https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
 ********************************/
const getFollowersIds = async function (screenName, count) {
    try {
        if (!count) { count = 5000; } //Assume count == 5000 of no value given
        const path          = 'followers/ids';
        let params          = { screen_name:  screenName, cursor: -1, stringify_ids: true, count: count };
        let response        = await Twitter.get(path, params);
        return response.data.ids;
    }
    catch (error) { console.log(error);}
}

/********************************
// GET users/lookup
// @ params : screenName          [Optional, The Twitter handle of the user ]
// @ params : twitterId           [Optional, The Twitter ID of the user]
https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-users-lookup
 ********************************/
const getUserLookupInfo = async function (screenName, twitterId) {
    try {
        const path          = 'users/lookup';
        let params          = { screen_name: screenName, user_id:  twitterId, include_entities: true, tweet_mode: false };
        //console.log(params);
        let response        = await Twitter.get(path, params);
        return response;
    }
    catch (error) { console.log(error); }
}

/********************************
// POST direct_messages/events/new
// @ params : recipient_id       [required, The ID of the user to whom DM is sent]
// @ params : message_data       [required, Message Content]
https://developer.twitter.com/en/docs/direct-messages/sending-and-receiving/api-reference/new-event
 ********************************/
const sendDirectMessage = async function (recipientId, textMessage) {
    try {
        const path          = 'direct_messages/events/new';
        let params          = {"event": {"type": "message_create", "message_create": {"target": {"recipient_id": recipientId}, "message_data": {"text": textMessage}}}} ;

        //console.log(JSON.stringify(params));
        let response        = await Twitter.post(path, params);
        //console.log(response.twitterReply);
        //response = [];
        return response;
    }
    catch (error) { console.log(error); }
}

/*******************************
 Module Exports
 *******************************/
module.exports = {
    rateLimitStatusFollowerIds,
    rateLimitStatusDmSent,
    verifyCredentials,
    getFollowersIds,
    getUserLookupInfo,
    sendDirectMessage
}
