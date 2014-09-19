
/**
 * ChoreSchema
 * -----------
 */

var mongoose = require('mongoose')
  , moment   = require('moment')
  , utils    = require('../utils');


var AssignmentSchema = new mongoose.Schema({
  chore:    String,
  notify:   Date,
  userId:   String,
  userName: String,
  notified: Date,
  assigned: Date,
  done: { type: Boolean, default: false }
}, {
  toJSON:{
    transform: function (doc, ret, options) {
      delete ret._id;
      delete ret.__v;
      delete ret.assigned;
      delete ret.notify;
      delete ret.userId;
      delete ret.userName;
      ret.user = '@' + doc.userName;
    }
  }
});

AssignmentSchema.pre('save', function (next) {
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


module.exports = AssignmentSchema;
