
/**
 * NOTIFY WORKER
 * =============
 *
 * Runs every 10 minutes, looks for assignments that:
 *   a) have a `notify` propery less than or equal to now
 *   b) have a `notified` property that is null or < it's `notify` property
 */

var utils = require('./lib/utils');
if (!utils.verifyEnv()) {
  utils.logger.error('Please verify your environment!');
  return;
}


/**
 * BOOTSTRAP
 * =========
 *
 * Pulling in dependencies.
 */

var _      = require('lodash')
  , async  = require('async')
  , Slack  = require('slack-node')
  , slack  = new Slack(process.env.SLACK_TOKEN)
  , models = require('./lib/models')
  , moment = require('moment');


/**
 * Notification Process
 * ====================
 */

async.waterfall([

  //
  // Gather matching assignments.
  //

  function gatherAssignments(cb) {
    models.Assignment.find({
      $and: [
        { notify: { $lt: moment().toDate() } },
        { notified: { $exists: false } }
      ]
    }).exec(cb);
  },

  function notifyViaSlack(assignments, cb) {
    var times = assignments.length;

    assignments.forEach(function (v) {
      slack.api('chat.postMessage', {
          channel: v.userId,
          username: process.env.SLACK_USER,
          text: "It's your turn to " + v.chore + "!",
          attachments: JSON.stringify([{
            fallback: "It's your turn to " + v.chore + "!",
            color: "warning",
            fields: [{ title: "Chore", value: v.chore, short: true }]
          }])
        }, function (err, data) {
          v.notified = moment().toDate();
          v.save(function () {
            times -= 1;
          });
        });
    });

    (function loop() {
      if (times > 0) return setTimeout(loop, 100);
      cb(null, assignments);
    }());
  }

], function (err, result) {
  //
});
