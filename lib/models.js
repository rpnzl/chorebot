
/**
 * Models
 * ======
 *
 */

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL);

module.exports = {
  Assignment: mongoose.model('Assignment', require('./schemas/assignment'))
};
