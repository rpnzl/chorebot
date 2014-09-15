module.exports = {

  /**
   * Remind Me In
   * ============
   *
   * /chorebot remind me in 1 hour
   */

  'remind me in': function (params, done) {},


  /**
   * Usage
   * =====
   *
   * /chorebot help
   */

  'help': function (params, done) {
    console.log(req.body);
    done(null, "help text");
  }

};
