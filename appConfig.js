
class keys {

    constructor() {
        // =====================================================================
        // App Config
        // =====================================================================
        //this.debug                = true ;
        this.debug                  = false ;

        // ---------------------------------------------------------------------
        // TWITTER RELATED CONFIGURATION
        // ---------------------------------------------------------------------
        // No of followers to get in each GET query, Max is 5000,
        this.get_followers_count    = 5000 ;


        // ---------------------------------------------------------------------
        // APP SETTINGS
        // ---------------------------------------------------------------------
        // App Restart/Retry Time (In Seconds)
        this.app_restart_interval   = 60 * 15 ; // In Seconds 60 * 15 = 15 Min

        // App Database File
        this.lowdb_file             = 'appDB.json' ;


        // ---------------------------------------------------------------------
        // NODE SETTINGS
        // ---------------------------------------------------------------------
        this.port                   = 3030 ;

        // Node Console Log Display
        this.hLine                  = '=================================================================================' ;
        this.hLine2                 = '---------------------------------------------------------------------------------' ;

    }
}

/*=================================
// MODULE EXPORTS
==================================*/
module.exports = {
    keys
}
