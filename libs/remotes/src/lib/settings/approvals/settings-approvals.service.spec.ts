import { axiosInstance } from '../../axios';
import { settingsApprovalsService } from './settings-approvals.service';

describe('SettingsApprovalsService', () => {
  describe('getApprovals method', () => {
    it('should return a transformed API response', async () => {
      const data = {
        program_approval_settings: [
          {
            id: 3,
            name: 'asdf',
          },
        ],
        access_approval_settings: [
          {
            id: 2,
            name: 'asdf',
          },
        ],
      };

      jest
        .spyOn(axiosInstance, 'get')
        .mockResolvedValue(Promise.resolve({ data }));
      const actual = await settingsApprovalsService.getApprovals();

      expect(actual).toEqual({
        programs: data.program_approval_settings.map(({ id, name }) => ({
          id: id.toString(),
          name,
        })),
        access: data.access_approval_settings.map(({ id, name }) => ({
          id: id.toString(),
          name,
        })),
      });
    });
  });

  describe('getApprovalProgram method', () => {
    it('should return a transformed API response', async () => {
      const data = {
        data: {
          approval_settings: {
            program: {
              name: 'asdf',
            },
            reason_required: true,
            deny_on_unreachable: true,
            peer_approval: true,
            self_approval: true,
            custom_commands: 'asdf',
            approval_duration: 1,
            approval_timeout: 1,
          },
        },
      };

      jest
        .spyOn(axiosInstance, 'get')
        .mockResolvedValue(Promise.resolve({ data }));
      const actual = await settingsApprovalsService.getApprovalProgram('1');

      expect(actual).toEqual({
        id: '1',
        name: data.data.approval_settings.program.name,
        reasonRequired: data.data.approval_settings.reason_required,
        blockNewSessions: data.data.approval_settings.deny_on_unreachable,
        approvalRequired: data.data.approval_settings.peer_approval,
        approvalType: 'anyone',
        allowSelfApproval: data.data.approval_settings.self_approval,
        customAutoApprovedCommands: data.data.approval_settings.custom_commands,
        restrictedUsers: [],
        sessionApprovalDuration: data.data.approval_settings.approval_duration,
        sessionRequestTimeout: data.data.approval_settings.approval_timeout,
      });
    });
  });

  describe('addAuthorizedUser method', () => {
    it('should return a transformed API response', async () => {
      const programApprovalId = '1';
      const userId = '2';

      jest.spyOn(axiosInstance, 'post').mockResolvedValue(Promise.resolve());
      await settingsApprovalsService.addAuthorizedUser(
        programApprovalId,
        userId,
      );

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `/api/approval_settings/${programApprovalId}/authorized_responders`,
        {
          id: userId,
        },
      );
    });
  });

  describe('removeAuthorizedUser method', () => {
    it('should return a transformed API response', async () => {
      const programApprovalId = '1';
      const userId = '2';

      jest.spyOn(axiosInstance, 'delete').mockResolvedValue(Promise.resolve());
      await settingsApprovalsService.removeAuthorizedUser(
        programApprovalId,
        userId,
      );

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        `/api/approval_settings/${programApprovalId}/authorized_responders?id=${userId}`,
      );
    });
  });
});
