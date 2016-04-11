var Knex = require('knex');
var path = require('path');

var knex;

var runner = function (knexOptions, schema, callback, log) {

  callback = callback || function () {};

  if (log === undefined) {
    log = true;
  }

  knex = knex || Knex(knexOptions);
  
  if (schema.length) {
    var command = schema.pop();
    if (typeof command === 'function') {
      command()
      .then(function () {
        runner(knexOptions, schema, callback, log);
      })
      .catch(function (error) {
        log && console.log('Knex Error: ',error);
        callback(error);
      });
    } else {
      runner(knexOptions, schema, callback, log);
    }
  } else {
    log && console.log('Knex Schema Built');
    if (!knexOptions.migrations) {
      callback();
      return;
    }
    knex.migrate.latest()
    .then(function () {
      log && console.log('Knex Migrations Complete');
      callback();
    })
    .catch(function (error) {
      log && console.error('Knex Migration Error: ', error);
      callback(error);
    });
  }

  return knex;
};

module.exports = runner;