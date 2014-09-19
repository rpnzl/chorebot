
/**
 * Commands
 * ========
 *
 * token=EIvtwv3A6OMxKSJsVJxdqRZX
 * team_id=T0001
 * channel_id=C2147483705
 * channel_name=test
 * user_id=U2147483697
 * user_name=Steve
 * command=/weather
 * text=94070
 */

var _      = require('lodash')
  , async  = require('async')
  , utils  = require('./utils')
  , models = require('./models')
  , moment = require('moment');

module.exports = {

  /**
   * Usage
   * -----
   *
   * /chorebot help
   */

  'help': function (params, done) {
    done(null, [
      "Learn about me (Chorebot) and how we can interact at",
      "http://chorebot.herokuapp.com"
    ].join(' '));
  },


  /**
   * Remind Me In
   * ------------
   *
   * /chorebot remind me in 1 hours
   */

  'remind me in': function (params, done) {
    var args = params.text.split(' ')
      , sig  = "/chorebot remind me in [#] [minutes|hours]";

    if (args.length !== 2) return done(null, badRequestResponse(sig));
    if (['minutes', 'hours'].indexOf(args[1]) === -1) return done(null, badRequestResponse(sig));

    async.waterfall([
      function getLatestAssignment(cb) {
        models.Assignment.findOne({
          userId: params.user_id,
          assigned: utils.getPreviousSunday()
        }).exec(cb);
      },
      function updateNotify(assignment, cb) {
        if (!assignment)     return cb(new Error("We had trouble finding your assignment!"));
        if (assignment.done) return cb(new Error("Your chore is already done!"));
        assignment.notify = moment().add(args[0].trim(), args[1].trim());
        assignment.notified = null;
        assignment.save(cb);
      }
    ], function (err, assignment) {
      if (err) return done(null, err.message || "Something weird happened here!");
      done(null, "Cool, we'll notify you around " + moment(assignment.notify).format('MMM Do [at] h:mma'));
    });
  },


  /**
   * Done
   * ----
   *
   * Mark a chore as complete.
   *
   * /chorebot done
   */

  'done': function (params, done) {
    async.waterfall([
      function getLatestAssignment(cb) {
        models.Assignment.findOne({
          userId: params.user_id,
          assigned: utils.getPreviousSunday()
        }).exec(cb);
      },
      function updateNotify(assignment, cb) {
        if (!assignment)     return cb(new Error("We had trouble finding your assignment!"));
        if (assignment.done) return cb(new Error("Your chore is already done!"));
        assignment.done = true;
        assignment.save(cb);
      }
    ], function (err, assignment) {
      if (err) return done(null, err.message || "Something weird happened here!");
      done(null, "Nice! You're all set.");
    });
  }

  // /chorebot text on 5555555555
  // /chorebot text off

};


function badRequestResponse(str) {
  var responses = [
    "Sorry, I didn't get that! Dust yourself off and try again like this:",
    "Whoa, slow your lint roller! Try again in this format:",
    "Far from squeaky clean, your reply should like like this:",
    "Stinky, stinky, stinky! HEFTY, HEFTY, HEF... sorry. Try that command again, like this:",
    "Swiffer mo-miffer-iffer banana-fanna-fo-fiffer, fee-fi-mo-miffer, try that again-iffer, like this-iffer:"
  ];

  return [
    _.shuffle(responses).pop(),
    str
  ].join(' ');
}
