import { axiosInstance } from '../axios';
import { ISettingsLogSessionApiResponse } from '../settings/i-settings-api-response';
import { activitiesService } from './activities-service';

const sampleActivities: ISettingsLogSessionApiResponse = {
  id: 123,
  start_time: '2020-01-01T00:00:00.000Z',
  end_time: '2020-01-01T00:00:00.000Z',
  ip_address: '1.1.1.1',
  metadata_: {
    session_id: '123',
    human_location: 'location',
    target_host: 'host',
  },
  creator: {
    email: 'email',
  },
  runbook: {
    id: 123,
    name: 'name',
  },
};

describe('acivitiesService', () => {
  describe('getAll', () => {
    it('should return an array of activities', async () => {
      const id = '123';
      const response = Promise.resolve({
        data: { data: { sessions: [sampleActivities] } },
      });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(response);

      const activities = await activitiesService.getAll();

      expect(activities[0].id).toBe(id);
    });
  });
});
