var dotenv = require('dotenv')
  , twilio = require('twilio')
  , client;


var number = '+19174212700';

dotenv.load();


client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

client.messages.create({
    body: "Hello, Miriam",
    to: number,
    from: '+19073121134'
}, function(err, message) {
  console.log(err);
    // process.stdout.write(message.sid);
});
