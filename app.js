
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

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


/**
 * ROUTES
 * ======
 */

app.get('/', function (req, res) {
  res.json({ chorebot: "says 'get back to work!'" });
});

app.post('/inbound', function (req, res) {
  winston.info(req.url, req.param('user_name'));
  res.send('nice!');
});


/**
 * START SERVER
 * ============
 */

app.listen(process.env.PORT || 3000);
