import HTTP from './http.js';

class Code {
  constructor() {
    this.http = new HTTP();
  }

  // This api use to share some private informations for others.
  // The code can be modified by author.
  // Support category:
  // users, conversations, authorizations, multisigs, collectibles, payments
  Show(id) {
    return this.http.requestByToken('GET', `/codes/${id}`);
  }
}

export default Code;
