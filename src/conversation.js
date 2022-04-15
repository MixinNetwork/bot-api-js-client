import HTTP from './http';
import Utils from './utils';

class Conversation {
  constructor(keystore) {
    this.keystore = keystore || {};
    this.utils = Utils;
    this.http = new HTTP(this.keystore);
  }

  // Create a conversation
  // Only app and messenger user can create conversation
  // There're two type of conversation: CONTACT, GROUP
  CreateConversation(body) {
    return this.http.request('POST', '/conversations', body);
  }

  // Update a conversation
  // Only GROUP conversation can be updated
  UpdateConversation(id, body) {
    return this.http.request('POST', `/conversations/${id}`, body);
  }

  // Owner and Admin can operate the conversation
  // Both owner and admin can add or remove user
  // Only owner can change user's role
  // action: ADD, REMOVE, ROLE
  OperateConversation(id, action, body) {
    return this.http.request('POST', `/conversations/${id}/participants/${action}`, body);
  }

  // User can do some actions with this api.
  // action: exit, join, mute, rotate
  DoConversation(id, action, body) {
    return this.http.request('POST', `/conversations/${id}/${action}`, body);
  }

  // Get the information of the conversation.
  GetConversation(id) {
    return this.http.request('GET', `/conversations/${id}`);
  }
}

export default Conversation;
