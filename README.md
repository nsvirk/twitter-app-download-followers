# twitter-app-download-followers
Twitter app to download followers information for custom twitter users

### Requirements
* Setup Nodejs
* Postgres

### Setup Instructions

1. Clone the repository
    * Make Directory and clone from github
    * Run npm install

2. Setup ".env" file from "sample.env" file
    * Enter Twitter Developer Credentials in ".env" file
   * Enter Postgres Database Credentials in ".env" file

3. Setup Postgres Database from provided SQL scripts in sql folder
   * Execute tableCursors.sql
   * Execute tableFollowersIds.sql

4. Configure "appConfig.js"

5. Run App
   * npm start
