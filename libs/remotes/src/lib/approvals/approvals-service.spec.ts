import { ApprovalStatus } from '@cased/data';
import { approvalsService, ServerApproval } from './approvals-service';
import { axiosInstance } from '../axios';

const buildServerApproval = (values: Partial<ServerApproval> = {}) => {
  const approval: ServerApproval = {
    id: '123',
    created_at: '2022-12-04T00:00:00Z',
    prompt: 'Test prompt',
    command: 'Test command',
    ip_address: '1.2.3.4',
    metadata_: {
      action: 'Test action',
      certificate_authentication: true,
      destination_server: 'test-server.com',
      destination_username: 'test-user',
      human_location: 'Test location',
      port: '22',
    },
    requestor: {
      email: 'test@example.com',
    },
    responder: {
      email: 'test-responder@example.com',
    },
    status: ApprovalStatus.Approved,
    ...values,
  };

  return approval;
};

describe('approvalsService', () => {
  describe('getAll', () => {
    it('should return an array of approvals', async () => {
      const id = 'id-testing-getAll';
      const response = Promise.resolve({
        data: { approvals: [buildServerApproval({ id })] },
      });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(response);

      const approvals = await approvalsService.getAll();
      expect(approvals).toBeInstanceOf(Array);
      expect(approvals.length).toBeGreaterThan(0);
      expect(approvals[0].id).toBe(id);
    });
  });

  describe('get', () => {
    it('should return an approval with the given id', async () => {
      const id = 'id-testing-get';
      const response = Promise.resolve({
        data: { approval: buildServerApproval({ id }) },
      });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(response);

      const approval = await approvalsService.get(id);
      expect(approval).toHaveProperty('id', id);
    });
  });

  describe('update', () => {
    it('should update the status of the given approval', async () => {
      // A bit of a hack, but uses the `approvalsService.get` method to create a valid IApproval object
      const response = Promise.resolve({
        data: { approval: buildServerApproval() },
      });
      jest.spyOn(axiosInstance, 'get').mockResolvedValueOnce(response);
      const approval = await approvalsService.get('');

      const updateResponse = Promise.resolve({
        data: {
          approval: buildServerApproval({ status: ApprovalStatus.TimedOut }),
        },
      });
      jest.spyOn(axiosInstance, 'patch').mockResolvedValueOnce(updateResponse);

      const updatedApproval = await approvalsService.update(approval);
      expect(updatedApproval).toHaveProperty('status', ApprovalStatus.TimedOut);
    });
  });

  describe('post', () => {
    it('should create an approval', async () => {
      const response = Promise.resolve({
        data: { approvalRequestId: '123' },
      });
      jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce(response);

      const approvalRequestId = await approvalsService.post('test-prompt');
      expect(approvalRequestId).toEqual('123');
    });
  });
});
