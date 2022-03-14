import User from './user'

const user = new User();
const appId = '';
const sessionId = '';
const privateKey = '';
const pin = '';
const pinToken = '';

test('user generate session keypair', () => {
  /*
  return user.createUser("full", appId, sessionId, privateKey).then((bare) => {
    console.log(bare)
  })
  */
});

test('user verify pin', () => {
  return user.verifyPin(pin, pinToken, appId, sessionId, privateKey).then((data) => {
    console.log(data)
  });
});
