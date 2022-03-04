import User from './user'

const user = new User();

test('user generate session keypair', () => {
  const appId = '';
  const sessionId = '';
  const privateKey = '';

  return user.createUser("full", appId, sessionId, privateKey).then((bare) => {
    console.log(bare)
  })
});
