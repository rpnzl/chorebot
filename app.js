
/**
 * CHOREBOT
 * ========
 */

var _          = require('lodash')
  , utils      = require('./lib/utils')
  , async      = require('async')
  , Models     = require('./lib/models')
  , moment     = require('moment')
  , express    = require('express')
  , winston    = require('winston')
  , commands   = require('./lib/commands')
  , mongoose   = require('mongoose')
  , bodyParser = require('body-parser')
  , app, models;


/**
 * CONFIGURATION
 * =============
 *
 * - verify environment variables are present
 * - setup services
 */

// verify env
if (!utils.verifyEnv()) {
  winston.error('Please verify your environment!');
  return;
}

// services
mongoose.connect(process.env.MONGOHQ_URL);
models = Models(mongoose);

// app
app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


/**
 * ROUTES
 * ======
 *
 * - one route in case anyone decides to visit the site
 * - one route that handles Slack post-backs
 */

// list
app.get('/', function (req, res) {
  async.waterfall([
    function findThisWeeksAssignments(cb) {
      models.Assignment.find({
        assigned: utils.getPreviousSunday().toDate()
      }).exec(function (err, assignments) {
        if (err) return cb(err);
        assignments.forEach(function (v) { v = v.toJSON(); });
        cb(null, assignments);
      });
    },
    function findLastWeeksAssignments(thisWeek, cb) {
      models.Assignment.find({
        assigned: utils.getPreviousSunday().subtract('days', 7).toDate()
      }).exec(function (err, assignments) {
        if (err) return cb(err);
        assignments.forEach(function (v) { v = v.toJSON(); });
        cb(null, thisWeek, assignments);
      });
    }
  ], function (err, thisWeek, lastWeek) {
    if (err) return winston.error(err);
    res.json({
      chorebot: "says 'get back to work!'",
      thisWeek: thisWeek,
      lastWeek: lastWeek
    });
  });
});

// postback
app.post('/inbound', function (req, res) {
  var text = req.param('text')
    , cmd;

  _.keys(commands).forEach(function (v) {
    if (text.indexOf(v) === 0) cmd = v;
  });

  commands[v || 'help'](req.body, function (err, result) {
    if (err) return winston.error(err);
    res.json(result);
  });
});


/**
 * START SERVER
 * ============
 */

app.listen(process.env.PORT || 3000);
