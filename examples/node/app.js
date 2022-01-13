const bot = require('../../lib/mixin')

const clientId = ''
const sessionId = ''
const privateKey = ''

var privatebuf = new Buffer(privateKey, 'base64')
console.log(privatebuf);
// create user
bot.client.request(clientId, sessionId, privatebuf, "GET", "/me", "").then((data) => {
  console.log(data);
});
