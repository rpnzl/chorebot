var dotenv  = require('dotenv')
  , moment  = require('moment')
  , winston = require('winston');

module.exports = {

  /**
   * Logger
   * ======
   *
   * Currently an instance of Winston.
   */

   logger: winston,


  /**
   * Env Verification
   * ================
   *
   */

  verifyEnv: function () {
    var valid = true;

    if (!process.env.NODE_ENV || process.env.NODE_ENV == 'development') {
      dotenv.load();
    }

    [
      'MONGOHQ_URL',
      'SLACK_TOKEN',
      'SLACK_USER'
    ].forEach(function (v) {
      if (!process.env[v]) valid = false;
    });

    return valid;
  },


  /**
   * Get Previous Sunday
   * ===================
   *
   * returns a moment object for the nearest past Sunday.
   */

  getPreviousSunday: function () {
    var now = moment();
    return moment({
      year:  now.year(),
      month: now.month(),
      day:   now.date() + (0 - now.day())
    });
  },


  /**
   * Get Upcoming Friday
   * ===================
   *
   * returns a moment object for this first upcoming Friday.
   */

  getUpcomingFriday: function () {
    var now = moment();
    return moment({
      year:  now.year(),
      month: now.month(),
      day:   now.date() + (5 - now.day()),
      hour:  12
    });
  }

};
