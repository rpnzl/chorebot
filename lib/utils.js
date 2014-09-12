module.exports = {

  /**
   * Env Verification
   * ================
   */

  verifyEnv: function () {
    var valid = true;

    [
      'MONGOHQ_URL',
      'SLACK_TOKEN',
      'SLACK_USER'
    ].forEach(function (v) {
      if (!process.env[v]) valid = false;
    });

    return valid;
  }

};
