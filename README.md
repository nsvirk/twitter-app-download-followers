# twitter-app-download-followers
Twitter app to download followers information for any twitter user into local database

### Requirements
* Nodejs
* Postgres
* Twitter developer credentials

### Setup Instructions

1. Clone the repository
    * Make Directory for app
    * Clone repository from github
    * Run npm install the dependencies in the local node_modules folder

2. Setup ".env" file from "sample.env" file
    * Enter Twitter developer credentials in ".env" file
    * Enter Postgres credentials in ".env" file

3. Setup Postgres Database from provided SQL scripts in sql folder
   * Execute tableCursors.sql
   * Execute tableFollowersIds.sql

4. Configure "appConfig.js"

5. Run App
   * npm start

#### Notes
   * Working app as of 05/2020, however being improved.
   * Downloads 75,000 max possble followers ids in about 40 seconds and inserts them to postgres database
   * Comments and questions are welcome
   * Please give me ideas to improve this 🙏🏻
