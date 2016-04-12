# knex-runner
Tiny library for building a knex schema and running migrations

Knex commands run asynchronously, so you must write some boilerplate code to ensure that all of your tables are created in the correct order. This library is that boilerplate code.

## Installation

`$ npm install knex-runner `

## Usage

```sh
  var runner = require('knex-runner.js');

  knex-runner({
    client: 'postgres',
      connection: MY_DATABASE_URL,
      migrations: {
        directory: 'my/database/migrations/path'
      }
    }, 
    schema
  );
```
This builds your schema, in order, and then runs any pending migrations.  

`schema` must be an array of `knex` database command functions, like so:

```sh
  var createOrdersTable = function () {
    return knex.schema.hasTable('orders')
    .then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('orders', function (order) {
          order.increments();
          order.string('product_name', 255);
        })
        .then(function (table) {
          console.log('created orders table');
        })
        .catch(function (err) {
          console.error('orders error: ',err);
        });
      } else {
        return new Promise(function (res, rej) {
          res();
        });
      }
    });
  };

  var createUsersTable = function () {
    return knex.schema.hasTable('users')
    .then(function (exists) {
      if (!exists) {
        return knex.schema.createTable('users', function (user) {
          user.increments();
          user.string('username', 255).index().unique();
          user.integer('last_order_id').unsigned().references('id').inTable('orders').index();
        })
        .then(function (table) {
          console.log('created users table');
        })
        .catch(function (error) {
          console.error('users error: ',error);
        });
      } else {
        return new Promise(function (res, rej) {
          res();
        });
      }
    });
  };

  var schema = [createOrdersTable, createUsersTable];
```

>**Important:** as illustrated above, your commands must resolve a promise at some point. Manufacture a promise and resolve it if your function does not need to perform any `knex` operations under certain circumstances.

## Parameters

`knexOptions:` knex database connection and configuration object

`schema:` array of knex database command functions

`callback:` (optional) function that should accept an `error` argument that will be invoked once the schema/migrations are fully run

`log:` (optional, defaults to true) log events to the console