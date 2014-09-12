module.exports = function Models(mongoose) {

  if (!mongoose || !mongoose.constructor || !mongoose.constructor.name) {
    throw new Error('Models expects and instance of Mongoose!');
  }

  if ([1,2].indexOf(mongoose.connection.readyState) === -1) {
    throw new Error("Models expects an ACTIVE Mongoose connection!");
  }

  return {
    Chore: mongoose.model('Chore', {
      name: String
    })
  };

};
