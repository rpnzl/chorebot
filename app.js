
/**
 * CHOREBOT
 * ========
 *
 * A web service and several processes that encompass chore tracking and
 * notifications for the office.
 *
 * `utils.verifyEnv()` MUST be called before pulling in the local
 * dependencies because it will handle assignment of environment vars in
 * development and general verification across the board.
 */

var utils = require('./lib/utils');
if (!utils.verifyEnv()) {
  return utils.logger.error('Please verify your environment!');
}


/**
 * BOOTSTRAP
 * =========
 *
 * Pulling in dependencies.
 */

require('express-namespace');
var app = require('express')();
app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded());
app.set('view engine', 'jade');


/**
 * ROUTES
 * ======
 *
 * - one route in case anyone decides to visit the site
 * - one route that handles Slack post-backs
 */

app.namespace('/', require('./lib/controllers')(app));
app.namespace('/api', require('./lib/controllers/api')(app));


/**
 * START SERVER
 * ============
 */

app.listen(process.env.PORT || 3000);
