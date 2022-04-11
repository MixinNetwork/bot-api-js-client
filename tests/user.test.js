import User from '../src/user';

describe('Tests for user', () => {
  const keystore = {
    user_id: '7a522ae4-841b-357b-a7b1-4f5f51488b8f',
    session_id: '9e8ba070-0e63-4488-89a2-f82c12bbd196',
    private_key: 'UVXRC3f4sWyFMFq2BmutrYWskXJFy6vmkXY_61weQ1VQl_H_oUba4BRh9nDv8BwlovfqmytE6Q8GEaPgEc09YQ',
    pin: '291843',
    pin_token: 'dRSDk0j2tkDF1hJak3MmSGYNEWPE5928IqvXTcIT3Uo',
  };
  const user = new User(keystore);

  test('user read me', () => user.me().then((data) => {
    expect(data.data.user_id).toMatch(keystore.user_id);
  }));

  test('fetch user by id', () => user.fetch(keystore.user_id).then((data) => {
    expect(data.data.user_id).toMatch(keystore.user_id);
  }));

  test('fetch user by ids', () => user.fetchUsers([keystore.user_id]).then((data) => {
    expect(data.data.length).toBe(1);
  }));

  test('user verify pin', () => user.verifyPin().then((data) => {
    expect(data.data.user_id).toMatch(keystore.user_id);
  }));

  // test ok, commented for invoiding to create useless user
  // test('create bare user', () => user.createBareUser(`jsclient test ${Date.now()}`).then((data) => {
  //   console.log(data);
  // }));

  test('user update me', () => {
    const body = {
      full_name: 'js client',
      avatar_base64: '',
      biography: '',
    };
    user.updateMe(body).then((data) => {
      expect(data.data.full_name).toMatch(body.full_name);
    });
  });

  test('user update me', () => {
    user.rotateCode().then((data) => {
      expect(data.data.user_id).toMatch(keystore.user_id);
    });
  });

  test('user update preferences', () => {
    const body = {
      receive_message_source: '',
      accept_conversation_source: '',
      accept_search_source: '',
      fiat_currency: '',
      transfer_notification_threshold: 0,
      transfer_confirmation_threshold: 0,
    };
    user.updatePreference(body).then((data) => {
      expect(data.data.user_id).toMatch(keystore.user_id);
    });
  });
});
