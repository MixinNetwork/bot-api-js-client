const bot = require('../../lib/mixin')

const clientId = ''
const sessionId = ''
const privateKey = ''

bot.client.request(clientId, sessionId, privateKey, "GET", "/me", "").then((data) => {
  console.log(data);
});
