var _       = require('lodash')
  , dotenv  = require('dotenv')
  , async   = require('async')
  , moment  = require('moment')
  , winston = require('winston')
  , Slack   = require('slack-node');


/**
 * Development Environment
 * =======================
 */

if (!process.env.NODE_ENV || process.env.NODE_ENV == 'development') {
  dotenv.load();
}


/**
 * Env Verification
 * ================
 */

function envVerification() {
  var valid = true;
  [
    'SLACK_TOKEN',
    'SLACK_USER',
    'CHORES'
  ].forEach(function (v) {
    if (!process.env[v]) valid = false;
  });
  return valid;
}


/**
 * Process Chores
 * ==============
 */

function processChores() {
  var slack  = new Slack(process.env.SLACK_TOKEN);
  async.waterfall([
    function getSlackUsers(cb) {
      slack.api('users.list', cb);
    },
    function pluckValidUsers(res, cb) {
      var ids = _.chain(res.members)
        .pluck('id')
        .intersection(process.env.USERS.split(','))
        .value();
      cb(null, ids);
    },
    function assignChores(ids, cb) {
      var choreMap = _.zipObject(ids, _.shuffle(process.env.CHORES.split(',')));
      cb(null, choreMap);
    },
    function sendMessages(choreMap, cb) {
      _.forOwn(choreMap, function (chore, id) {
        slack.api('chat.postMessage', {
          channel: id,
          username: process.env.SLACK_USER,
          text: "It's your turn to " + chore + "!",
          attachments: JSON.stringify([{
            fallback: "It's your turn to " + chore + "!",
            color: "warning",
            fields: [{ title: "Chore", value: chore, short: true }]
          }])
        }, function (err, res) {
          if (err) return cb(err);
          console.log(res);
        });
      });
    }
  ], function (err, result) {
    console.log('done');
  });
}


/**
 *
 */

// if (moment().day() == 5 && envVerification()) {
  return processChores();
// }
