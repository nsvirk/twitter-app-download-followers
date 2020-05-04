var TwitWrapper     = require('./twitWrapper.js');

/******************************************************/
// API Endpoint :   GET users/lookup
// Description  :   Get user information
// params       :   user_id and/or screen_name
// response     :  [ { {user-object}, {user-object} } ]
/******************************************************/
const userLookup = async function (screenName, userId) {
    try {
        const path      = 'users/lookup';
        const params    = { "screen_name": screenName, "user_id": userId, "include_entities": false } ;

        const response  = await TwitWrapper.get(path, params);
        //console.log('userLookup Response:');
        //console.log(response.data);
        return response ;
    }
    catch(error){

    }
}


/**
 *
 * @param {*} account - Account user name
 * @returns - Returns account object
 */
const fetchUserData = async account => {
  try {
    const params = { screen_name: account };
    // # return data obj
    const { data } = await Twitter.get('/users/show', params);
    // # return data
    return {
      id: data.id,
      id_str: data.id_str,
      name: data.name,
      screen_name: data.screen_name,
      location: data.location,
      description: data.description,
      url: data.url,
      protected: data.protected,
      followers_count: data.followers_count,
      profile_pic: data.profile_image_url_https
    };
  } catch (e) {
    if (e) {
      throw new Error(e);
    }
  }
};

/******************************************************/
// Description  :   Get user_id from screen_name
// params       :   screen_name required
// response     :  'id_str'
/******************************************************/
const getUserId = async function (screenName) {
    try {
        const response  = await userLookup(screenName);
        const idStr     = response.data[0].id_str ;
        //console.log('getUserId Response:'); //console.log(idStr);
        return idStr ;
    }
    catch(error){

    }
}

/*******************************
 Module Exports
 *******************************/
module.exports = {
    userLookup,
    getUserId
}
