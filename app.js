
/**
 * CHOREBOT
 * ========
 */

var _          = require('lodash')
  , utils      = require('./lib/utils')
  , async      = require('async')
  , Slack      = require('slack-node')
  , Models     = require('./lib/models')
  , dotenv     = require('dotenv')
  , moment     = require('moment')
  , express    = require('express')
  , winston    = require('winston')
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

// load env
if (!process.env.NODE_ENV || process.env.NODE_ENV == 'development') {
  dotenv.load();
}

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

// site
app.get('/', function (req, res) {
  async.waterfall([
    function findThisWeeksChores(cb) {
      models.Chore.find({
        assigned: utils.getPreviousSunday().toDate()
      }).exec(function (err, chores) {
        if (err) return cb(err);
        chores.forEach(function (v) { v = v.toJSON(); });
        cb(null, chores);
      });
    },
    function findLastWeeksChores(thisWeek, cb) {
      models.Chore.find({
        assigned: utils.getPreviousSunday().subtract('days', 7).toDate()
      }).exec(function (err, chores) {
        if (err) return cb(err);
        chores.forEach(function (v) { v = v.toJSON(); });
        cb(null, thisWeek, chores);
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
  var cmd = req.param('text').split(' ')[0]
    , msg;

  if (cmd === 'help') {
    msg = [
      '',
      'CHOREBOT HELP',
      '=============',
      ''
    ].join('\n');
  } else if (cmd === 'done') {
    //
  }

  res.send(msg);
});


/**
 * START SERVER
 * ============
 */

app.listen(process.env.PORT || 3000);
