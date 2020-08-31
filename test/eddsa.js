const Bot = require('../lib/mixin').default

const sessionKeyPair = new Bot().generateEdDSASessionKeypair()
console.log('sessionKeyPair', sessionKeyPair)

const jwt = new Bot().signEdDSAAuthenticationToken('uid', 'sid', sessionKeyPair.private, 'method', 'uri', 'params', 'scp')
console.log('jwt', jwt)
