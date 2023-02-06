import { storageService, TOKEN_ID } from './storage-service';

describe('storageService', () => {
  beforeEach(() => {
    document.cookie = '';
  });

  describe('get method', () => {
    it('should return the value of the cookie', () => {
      document.cookie = 'cookieName=cookieValue';
      const result = storageService.get('cookieName');
      expect(result).toEqual('cookieValue');
    });
  });

  describe('set method', () => {
    it('should set the cookie', () => {
      storageService.set('cookieName', 'cookieValue');
      expect(document.cookie).toEqual('cookieName=cookieValue');
    });
  });

  describe('remove method', () => {
    it('should remove the cookie', () => {
      document.cookie = 'cookieName = cookieValue';
      storageService.remove('cookieName');
      expect(document.cookie).toEqual('cookieName=');
    });
  });

  describe('clear method', () => {
    it('should clear the cookies', () => {
      storageService.set(TOKEN_ID, 'cookieValue');
      storageService.clear();
      const result = storageService.get('cookieName');

      expect(result).toEqual(undefined);
    });
  });
});
