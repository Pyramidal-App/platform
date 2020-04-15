# Pyramidal App Platform

This is a NodeJS application that implements a GQL server.
It is consumed by the [front app](https://github.com/Pyramidal-App/front),
allowing the front to login and register users, persist data, and subscribe to notifications.

## Setup

The main dependencies for this app are PostgreSQL and MongoDB database engines.

### Installing PostgreSQL

  - In Ubuntu or other Debian based Linux distros:

  ~~~bash
  $ sudo apt-get install postgresql postgresql-contrib #
  ~~~

  - In OSx: Check https://gist.github.com/ibraheem4/ce5ccd3e4d7a65589ce84f2a3b7c23a3.

Once installed, you need to setup the password of the PostgreSQL default user "postgres" to "postgres" (yes, username and password are the same).

~~~bash
$ sudo -u postgres psql postgres
postgres=# \password postgres
~~~

The default username and password are set in [db/config.js](https://github.com/Pyramidal-App/platform/blob/master/db/config.js), and can also be overriden at run time by passing `DB_USERNAME` and `DB_PASSWORD` bash environment variables.

~~~bash
DB_USERNAME=pepe DB_PASSWORD=123 yarn start
~~~

### Installing MongoDB
**MongoDB is optional**, only required for running notifications system. You can skip this step unless your are specifically working on async notifications feature, or any other feature that uses background jobs.

  - In Ubuntu or other Debian based Linux distros: check https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
  - In Mac: check https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/

### Setuping main project

~~~bash
# Install dependencies
$ yarn install

# Create needed PostgreSQL database and it's tables
$ yarn seq db:create
$ yarn seq db:migrate

# Set the needed environment variables
# If you are using direnv, these will be automatically read when you enter the project directory.
$ copy .envrc.example .envrc

# If you are not using direnv, you need to source this file before running the server
$ source .envrc

# Finally, run the server
$ yarn start
~~~

## Debugging

You can always use `console.log` and check the server log, 
