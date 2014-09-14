
/**
 * ChoreSchema
 * -----------
 */

var mongoose = require('mongoose')
  , moment   = require('moment')
  , utils    = require('../utils');


var ChoreSchema = new mongoose.Schema({
  name:     String,
  user:     String,
  notify:   Date,
  notified: Date,
  assigned: Date,
  done: { type: Boolean, default: false }
}, {
  toJSON:{
    transform: function (doc, ret, options) {
      delete ret._id;
      delete ret.__v;
      delete ret.assigned;
    }
  }
});

ChoreSchema.pre('save', function (next) {
  var now = moment();

  // assigning to Sunday at 12am
  if (!this.assigned) {
    this.assigned = utils.getPreviousSunday().toDate()
  }

  // notifying Friday at 12pm, by default
  if (!this.notify) {
    this.notify = utils.getUpcomingFriday().toDate();
  }

  next();
});


module.exports = ChoreSchema;
