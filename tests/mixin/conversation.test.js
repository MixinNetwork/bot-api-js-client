import Conversation from '../../src/mixin/conversation';
import keystore from './keystore';

describe('Tests for conversation', () => {
  const conversation = new Conversation(keystore);
  const conversationID = '23a37eac-5e8d-48c9-918e-2e39249719ae';
  let body = {
    conversation_id: conversationID,
    category: 'GROUP',
    name: 'creating conversation from js client',
    announcement: 'Test conversation from js client description',
    participants: [
      {
        user_id: 'e9e5b807-fa8b-455a-8dfa-b189d28310ff',
      },
    ],
  };

  test('Test for create conversation', () => {
    conversation.CreateConversation(body).then((resp) => {
      const result = resp.data.data;
      expect(result.conversation_id).toMatch(conversationID);
    });
  });

  test('Test for do some action for conversation', () => {
    body = {
      duration: 1000,
    };
    conversation.DoConversation(conversationID, 'mute', body).then((resp) => {
      const result = resp.data.data;
      expect(result.conversation_id).toMatch(conversationID);
    });
  });

  test('Test for do get conversation', () => conversation.GetConversation(conversationID).then((resp) => {
    const result = resp.data.data;
    expect(result.conversation_id).toMatch(conversationID);
  }));
});
