//NPM PACKAGES
let dotenv          = require('dotenv').config();
let moment          = require('moment');

//App Config
let Config          = require('./appConfig.js') ;
let AppConfig       = new Config.keys() ;

//lowdb
const low           = require('lowdb');
const FileSync      = require('lowdb/adapters/FileSync');
const adapter       = new FileSync(AppConfig.lowdb_file);
const db            = low(adapter);

//App VARIABLES
const hLine         = AppConfig.hLine ;
const hLine2        = AppConfig.hLine2 ;

/********************************
// Default Data File Structure
 ********************************/
//Wite a Default Db file if none exists on App start
    db.defaults(
        {
          "status": {
            "direct_messages": [
              /*{
                "screen_name": "",
                "sent_count": 0,
                "as_on": ""
            }*/
            ],
            "cursors": [
              /*{
                "screen_name": "",
                "last_follower_id": "",
                "as_on": ""
            }*/
            ]
          }
        }
    ).write();

/********************************
// getAsOnValue
// @ returns    : Object                (Object with new values)
 ********************************/
const asOn = () => {
        return moment().format("YYYY-MM-DD hh:mm:ss");
}

/********************************
// setLastFollowerId
// @ params     : screen_name           (required, Screen name for which to get)
// @ params     : last_follower_id      (required, Value to set)
// @ returns    : Object                (Object with new values)
// https://www.diycode.cc/projects/typicode/lowdb (Check out this help)
 ********************************/
const setLastFollowerId = async (screenName, followerId) => {
    //console.log(hLine2);
    //console.log('RUN => lowdbHelpers.js => setLastFollowerId');
    //Check if Exists
    let exists = db.get('status.cursors').find( { 'screen_name' : screenName} ).value();
    let result ;
    //Update or Insert
    if (!exists) {
        //console.log('        * Inserting last_follower_id: ' + followerId);
        db.get('status.cursors').push( { 'screen_name': screenName,  'last_follower_id': followerId, 'as_on': asOn() }).write();
    } else {
        //console.log('        * Updating last_follower_id: ' + followerId);
        // Bug Solution at https://github.com/typicode/lowdb/issues/393
        db.get('status.cursors').splice(
            db.get('status.cursors').findIndex({ 'screen_name' : screenName}), 1, {'screen_name' : screenName, 'last_follower_id': followerId, 'as_on': asOn() }
        ).write();
    }

    result = await db.get('status.cursors').find({ 'screen_name' : screenName}).value();
    return result;
}

/********************************
// getLastFollowerId
// @ params     : screen_name       (required, The screen name of the user for whom to return results)
// @ returns    : Object            (Object as per query)
 ********************************/
const getLastFollowerId = async (screenName) => {
    //console.log(hLine2);
    //console.log('RUN => lowdbHelpers.js => getLastFollowerId');
    //let result = db.get('cursors').find({ 'screen_name' : screenName}).get('last_follower_id').value();
    let result = db.get('status.cursors').find({ 'screen_name' : screenName}).value();
    //console.log(result);
    return result ;
}

/********************************
// setDirectMessageSentCount
// @ params     : screen_name           (required, Screen name for which to set)
// @ returns    : Object                (Object with new values)
// https://www.diycode.cc/projects/typicode/lowdb (Check out this help)
 ********************************/
const setDirectMessageSentCount = async (screenName) => {
    //console.log(hLine2);
    //console.log('RUN => lowdbHelpers.js => setDirectMessageSentCount');
    //Check if Exists
    let exists = db.get('status.direct_messages').find( { 'screen_name' : screenName} ).value();
    let result ;
    //Update or Insert
    if (!exists) {
        //console.log('        * Inserting last_follower_id: ' + followerId);
        db.get('status.direct_messages').push( { 'screen_name': screenName,  'sent_count': 1, 'as_on': asOn()}).write();
    } else {
        //console.log('        * Updating last_follower_id: ' + followerId);
        // Bug Solution at https://github.com/typicode/lowdb/issues/393
        //First Get Count
        let presentCountObj = db.get('status.direct_messages').find({ 'screen_name' : screenName}).value();
        let presentCount    = presentCountObj.sent_count ;
        //Increment Count by 1
        let newCount        = parseInt(presentCount) + 1 ;
        //Set Count
        db.get('status.direct_messages').splice(
            db.get('status.direct_messages').findIndex({ 'screen_name' : screenName}), 1, {'screen_name' : screenName, 'sent_count': newCount, 'as_on': asOn() }
        ).write();
    }

    result = await db.get('status.direct_messages').find({ 'screen_name' : screenName}).value();
    return result;
}

/********************************
// getDirectMessageSentCount
// @ params     : screen_name       (required, Screen name for which to get)
// @ returns    : Object            (Object as per query)
 ********************************/
const getDirectMessageSentCount = async (screenName) => {
    //console.log(hLine2);
    //console.log('RUN => lowdbHelpers.js => getDirectMessageSentCount');
    //let result = db.get('cursors').find({ 'screen_name' : screenName}).get('last_follower_id').value();
    let result = db.get('status.direct_messages').find({ 'screen_name' : screenName}).value();
    //console.log(result);
    return result ;
}
/*******************************
 Module Exports
 *******************************/
module.exports = {
    setLastFollowerId,
    getLastFollowerId,
    setDirectMessageSentCount,
    getDirectMessageSentCount
}
