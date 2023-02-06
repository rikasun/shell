import { axiosInstance } from '../axios';
import { IRunbookGetAllResponse, runbooksService } from './runbooks-service';

describe('runbooksService', () => {
  describe('getAll method', () => {
    it('should return an array of runbooks', async () => {
      const data: IRunbookGetAllResponse = {
        runbooks: [
          {
            id: 1,
            name: 'test',
            description: 'test',
            last_run: '2020-01-01',
          },
        ],
      };
      const response = Promise.resolve({ data });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(response);
      const { runbooks } = await runbooksService.getAll();
      expect(runbooks.length).toEqual(1);
      runbooks.forEach((runbook) => {
        expect(runbook).toEqual({
          id: expect.any(Number),
          name: expect.any(String),
          description: expect.any(String),
          lastRun: expect.any(String),
        });
      });
    });
  });
});
