const Mixin = require('../../lib/mixin')

const bot = new Mixin()

const clientId = ''
const sessionId = ''
const privateKey = ''

// create user
bot.createUser('username', clientId, sessionId, privateKey).then((userData) => {
  console.log('create user', userData)
  // setup pin
  bot.setupPin('123456', userData.user, userData.sessionKey).then((setupData) => {
    console.log('setup pin', setupData)
  })
})
