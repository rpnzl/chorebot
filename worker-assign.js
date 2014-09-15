
/**
 * ASSIGN WORKER
 * =============
 *
 * Runs daily, checks for existing chore assignments for the current week and
 * if they don't exist sets them up.
 */

var _        = require('lodash')
  , async    = require('async')
  , utils    = require('./lib/utils')
  , Slack    = require('slack-node')
  , Models   = require('./lib/models')
  , winston  = require('winston')
  , mongoose = require('mongoose')
  , models, slack, CHORES, USERS;


if (!utils.verifyEnv()) {
  winston.error('Please verify your environment!');
  return;
}


mongoose.connect(process.env.MONGOHQ_URL);
models = Models(mongoose);
slack  = new Slack(process.env.SLACK_TOKEN);


/**
 * Assignment Process
 * ==================
 *
 *
 */

async.waterfall([

  //
  //
  //

  function checkForExistingTasks(cb) {
    models.Assignment.count({
      assigned: utils.getPreviousSunday().toDate()
    }).exec(function (err, count) {
      if (err)   return cb(err);
      if (count) return winston.warn('Tasks have already been assigned!');
      cb();
    });
  },

  //
  //
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
  //
  //

  function processNewAssignments(users, cb) {
    var chores      = process.env.CHORES.split(',')
      , assignments = [];

    async.map(users, function (user, done) {
      models.Assignment
      .find({ userId: user.id })
      .limit(chores.length)
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
  //
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
  console.log(err, result);
});
