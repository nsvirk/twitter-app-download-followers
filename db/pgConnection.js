    /**
    * @fileoverview    :   Create Connection Pool to access Postgres
    * @dependencies    :   npm packages => pg, dotenv
    */

    const dotenv            = require('dotenv').config()
    const { Pool }          = require('pg')

    /**
    *  Create a Connection String depending on the environment
    */
    //const connectionString  = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

    /**
    *  Create a Connection pool
    */
    const pool = new Pool({
      user:         process.env.DB_USER,
      password:     process.env.DB_PASSWORD,
      host:         process.env.DB_HOST,
      port:         process.env.DB_PORT,
      database:     process.env.DB_DATABASE,
      max:                      20,
      idleTimeoutMillis:        30000,
      connectionTimeoutMillis:  2000,
    });

    /**
    *  pool On
    */
    pool.on('error', (err, client) => {
        console.error('Postgres connection pool error : Unexpected error on idle client', err)
        process.exit(-1) ;
    });

    /**
    * ==========================================================================
    *  Module Exports
    * ==========================================================================
    **/

    module.exports = { pool }
