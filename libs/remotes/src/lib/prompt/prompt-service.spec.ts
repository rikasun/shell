import { promptService } from './prompt-service';
import { axiosInstance } from '../axios';

const buildPrompt = (overrides = {}) => ({
  path: 'path',
  session_id: 'session_id',
  hostname: 'hostname',
  port: 'port',
  close_terminal_on_exit: 'close_terminal_on_exit',
  username: 'username',
  certificate_authentication: 'certificate_authentication',
  initial_command: 'initial_command',
  labels: 'labels',
  name: 'name',
  slug: 'slug',
  ...overrides,
});

describe('promptService', () => {
  describe('getAll', () => {
    it('should return all prompts', async () => {
      const response = Promise.resolve({
        data: { prompts: [buildPrompt(), buildPrompt()] },
      });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(response);

      const prompts = await promptService.getAll();
      expect(prompts).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('should return an prompt with the given slug', async () => {
      const slug = 'slug-testing-get';
      const response = Promise.resolve({
        data: { prompt: buildPrompt({ slug }) },
      });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(response);

      const prompt = await promptService.get(slug);
      expect(prompt).toHaveProperty('slug', slug);
    });
  });

  describe('get', () => {
    it('should return an prompt with the given id', async () => {
      const slug = 'slug-testing-get';
      const response = Promise.resolve({
        data: { prompt: buildPrompt({ slug }) },
      });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(response);

      const prompt = await promptService.get(slug);
      expect(prompt).toHaveProperty('slug', slug);
    });
  });

  describe('getWebSocketUrl', () => {
    it('should return a websocket url for the given prompt', async () => {
      const slug = 'slug-testing-getWebSocketUrl';
      const approvalStatus = 'approved';
      const data = { reason: 'test reason' };
      const getResponse = Promise.resolve({
        data: { prompt: buildPrompt({ slug }) },
      });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(getResponse);

      const postResponse = Promise.resolve({
        status: 200,
        data: { id: 'id', session_id: 'session_id' },
      });
      jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce(postResponse);

      const { url, promptSessionId } = await promptService.getWebSocketUrl(
        slug,
        approvalStatus,
        data,
      );
      expect(url).toBe(`wss://testing.testing.testing/v2/ws/session_id/id`);
      expect(promptSessionId).toBe(`session_id`);
    });

    it('throw an error if the user does not have access to the prompt', async () => {
      const slug = 'slug-testing-getWebSocketUrl';
      const approvalStatus = '';
      const data = { reason: 'test reason' };
      const getResponse = Promise.resolve({
        data: { prompt: buildPrompt({ slug }) },
      });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(getResponse);

      const postResponse = Promise.resolve({
        status: 401,
        data: { id: 'id', session_id: 'session_id' },
      });
      jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce(postResponse);

      await expect(
        promptService.getWebSocketUrl(slug, approvalStatus, data),
      ).rejects.toThrow(
        'Prompt slug-testing-getWebSocketUrl requires approval.',
      );
    });
  });
});
