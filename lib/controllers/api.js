var _        = require('lodash')
  , utils    = require('../utils')
  , async    = require('async')
  , models   = require('../models')
  , commands = require('../commands');

module.exports = function (app) {
  return function bindRoutes() {

    /**
     * Slack POST Requests
     * ===================
     *
     *
     */

    app.post('/inbound', function (req, res) {
      var text = req.param('text')
        , cmd;

      _.keys(commands).forEach(function (v) {
        if (text.indexOf(v) === 0) cmd = v;
      });

      req.body.text = req.body.text.replace(cmd, '').trim();
      commands[cmd || 'help'](req.body, function (err, result) {
        if (err) utils.logger.error(err);
        res.json(result || "Something happened, we really spilled the beans! Bad Chorebot! Bad!");
      });
    });

  }
};
