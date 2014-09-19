
/**
 * ASSIGN WORKER
 * =============
 *
 * Runs daily, checks for existing chore assignments for the current week and
 * if they don't exist sets them up.
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
  , models = require('./lib/models');


/**
 * Assignment Process
 * ==================
 *
 *
 */

async.waterfall([

  //
  // Check that tasks haven't been assigned for this week yet. If they
  // have been assigned already, kill the process.
  //

  function checkForExistingTasks(cb) {
    models.Assignment.count({
      assigned: utils.getPreviousSunday().toDate()
    }).exec(function (err, count) {
      if (err)   return cb(err);
      if (count) return utils.logger.warn('Tasks have already been assigned!');
      cb();
    });
  },

  //
  // Match existing Slack users against the list of users set in the
  // environment. Only pass along users that exist in both locations.
  //

  function getMatchingSlackUsers(cb) {
    var users   = process.env.USERS.split(',')
      , matched = [];

    slack.api('users.list', function (err, res) {
      if (err)          return cb(err);
      if (!res.members) return cb(new Error('Slack response was invalid!'));
      res.members.forEach(function (v) {
        if (users.indexOf(v.name) > -1) matched.push(v);
      });
      cb(null, matched);
    });
  },

  //
  // Attempt to assign chores to users which (assuming n = # of
  // various chores):
  //   - they haven't had in (n - 1) assignments
  //

  function processNewAssignments(users, cb) {
    var chores      = process.env.CHORES.split(',')
      , assignments = [];

    async.map(users, function (user, done) {
      models.Assignment
      .find({ userId: user.id })
      .limit(chores.length - 1)
      .sort({ assigned: 'desc' })
      .exec(function (err, previousAssignments) {
        var assignment = {
          user: user,
          chore: _(chores)
            .difference(_.pluck(assignments, 'chore'))
            .difference(_.pluck(previousAssignments, 'chore'))
            .shuffle()
            .pop()
        };

        assignments.push(assignment);
        done(null, assignment);
      });
    }, cb);
  },

  //
  // Store the assignments in the database.
  //

  function persistAssignments(assignments, cb) {
    async.each(assignments, function (assignment, done) {
      models.Assignment.create({
        chore:    assignment.chore,
        userId:   assignment.user.id,
        userName: assignment.user.name
      }, done);
    }, cb);
  }

], function (err, result) {
  if (err) return utils.logger.error(err);
  return utils.logger.info('Chores assigned successfully.');
});
