const bot = require('../../lib/mixin')

const clientId = ''
const sessionId = ''
const privateKey = ''

console.log(bot.util.hashMembers(["e95b1d4e-4d49-4ac3-9402-988804458adc", "e9e5b807-fa8b-455a-8dfa-b189d28310ff"]))

/*
// create user
bot.createUser('username', clientId, sessionId, privateKey).then((userData) => {
  console.log('create user', userData)
  // setup pin
  bot.setupPin('123456', userData.user, userData.sessionKey).then((setupData) => {
    console.log('setup pin', setupData)
  })
})
*/
