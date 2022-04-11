import Conversation from '../src/conversation';
import keystore from './keystore';

describe('Tests for conversation', () => {
  const conversation = new Conversation(keystore);

  test('Test for create conversation', () => conversation.CreateConversation().then((data) => {
    expect(data.data.user_id).toMatch(keystore.user_id);
  }));

  test('Test for update conversation', () => conversation.UpdateConversation().then((data) => {
    expect(data.data.user_id).toMatch(keystore.user_id);
  }));

  test('Test for operate conversation for owner', () => conversation.OperateConversation().then((data) => {
    expect(data.data.user_id).toMatch(keystore.user_id);
  }));

  test('Test for do some action for conversation', () => conversation.DoConversation().then((data) => {
    expect(data.data.user_id).toMatch(keystore.user_id);
  }));

  test('Test for do get conversation', () => conversation.GetConversation().then((data) => {
    expect(data.data.user_id).toMatch(keystore.user_id);
  }));
});
