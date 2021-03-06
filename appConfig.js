
class keys {

    constructor() {

        // ---------------------------------------------------------------------
        // APP SETTINGS
        // ---------------------------------------------------------------------
        // App Restart/Retry Time (In Seconds) // Not dependant on Rate Limit Reset
        // Suggested Setting = 15 Min, Cannot be less than 15 Min as this is Twitter limitation
        this.app_restart_interval   = 60 * 15 ; // In Seconds // 60 * 15 = 15 Min

        // ---------------------------------------------------------------------
        // TWITTER RELATED CONFIGURATION
        // ---------------------------------------------------------------------
        // Twitter User for whom to download folloers
        this.target_screen_name     = 'nsvirk' ;

        // ---------------------------------------------------------------------
        // NODE SETTINGS
        // ---------------------------------------------------------------------
        // Node Server Port
        this.port                   = 3701 ;

        // ---------------------------------------------------------------------
        // DISPLAY SETTINGS
        // ---------------------------------------------------------------------
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
