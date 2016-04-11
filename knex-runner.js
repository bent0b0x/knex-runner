var Knex = require('knex');
var path = require('path');

var knex;

var runner = function (knexOptions, schema, callback) {
  callback = callback || function () {};
  knex = knex || Knex(knexOptions);
  if (schema.length) {
    var command = schema.pop();
    if (typeof command === 'function') {
      command()
      .then(function () {
        runner(knexOptions, schema);
      })
      .catch(function (error) {
        console.log('Knex Error: ',error);
        callback(error);
      });
    } else {
      runner(knexOptions, schema);
    }
  } else {
    console.log('Knex Schema Built');
    if (!knexOptions.migrations) {
      callback();
      return;
    }
    knex.migrate.latest()
    .then(function () {
      console.log('Knex Migrations Complete');
      callback();
    })
    .catch(function (error) {
      console.error('Knex Migration Error: ', error);
      callback(error);
    });
  }

  return knex;
};

module.exports = runner;