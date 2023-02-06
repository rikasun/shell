import { IUser } from '@cased/remotes';

export class UserBuilder {
  _email = 'asdf@asdf.com';

  build(): IUser {
    return {
      id: '1',
      email: this._email,
    };
  }

  withEmail(email: string) {
    this._email = email;
    return this;
  }
}
