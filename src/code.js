import HTTP from './http';

class Code {
  constructor() {
    this.http = new HTTP();
  }

  // User can get some private information by code id.
  // Code id can be changed by author.
  // Support category:
  // users
  // conversations
  // authorizations
  // multisigs
  // collectibles
  // payments
  Show(id) {
    return this.http.requestByToken('GET', `/codes/${id}`);
  }
}

export default Code;
