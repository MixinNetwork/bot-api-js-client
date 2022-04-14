import HTTP from './http';

class Code {
  constructor() {
    this.http = new HTTP();
  }

  // Code is using to share some private information for others.
  // The code can be modified by author.
  // Support category:
  // users, conversations, authorizations, multisigs, collectibles, payments
  Show(id) {
    return this.http.requestByToken('GET', `/codes/${id}`);
  }
}

export default Code;
