
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

var _ = require('lodash');

module.exports = {

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
    done(null, "You got it! Reminding you in " + args.join(' '));
  },


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
  }

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
