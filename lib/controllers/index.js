var utils  = require('../utils')
  , async  = require('async')
  , models = require('../models');

module.exports = function (app) {
  return function bindRoutes() {

    /**
     * Index
     */

    app.get('/', function (req, res) {
      models.Assignment.find({
        assigned: utils.getPreviousSunday().toDate()
      }).exec(function (err, assignments) {
        if (err) utils.logger.error(err);
        res.render('index.jade', {
          formattedDate: utils.getPreviousSunday().format('dddd, MMMM Do YYYY'),
          assignments: assignments
        });
      })
    });

  }
};
