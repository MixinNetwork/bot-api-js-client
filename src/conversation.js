import HTTP from './http';
import Utils from './utils';

class Conversation {
  constructor(keystore) {
    this.keystore = keystore || {};
    this.utils = Utils;
    this.http = new HTTP(this.keystore);
  }

  CreateConversation(body) {
    return this.http.request('POST', '/conversations', body);
  }

  UpdateConversation(id, body) {
    return this.http.request('POST', `/conversations/${id}`, body);
  }

  // action: ADD, REMOVE, ROLE
  OperateConversation(id, action, body) {
    return this.http.request('POST', `/conversations/${id}/participants/${action}`, body);
  }

  // action: exit, join, mute, rotate
  DoConversation(id, action, body) {
    return this.http.request('POST', `/conversations/${id}/${action}`, body);
  }

  GetConversation(id) {
    return this.http.request('GET', `/conversations/${id}`);
  }
}

export default Conversation;
