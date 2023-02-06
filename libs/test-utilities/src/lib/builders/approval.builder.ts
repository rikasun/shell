import { ApprovalStatus, IApproval } from '@cased/data';

export class ApprovalBuilder {
  requestorEmail = 'email@email.com';
  status = ApprovalStatus.Approved;

  build(): IApproval {
    return {
      id: '1',
      createdAt: new Date(),
      requestor: {
        email: this.requestorEmail,
        avatarUrl: 'https://example.com/avatar.png',
      },
      responder: {
        email: 'email@emai.com',
      },
      action: 'something',
      command: 'command',
      status: this.status,
      certificateAuthentication: true,
      destinationServer: 'https://example.com',
      destinationUserName: 'user',
      humanLocation: 'San Francisco',
      ip: '192.1.1.1',
      port: '9000',
    };
  }

  withRequestorEmail(email: string): ApprovalBuilder {
    this.requestorEmail = email;
    return this;
  }

  withStatus(status: ApprovalStatus): ApprovalBuilder {
    this.status = status;
    return this;
  }
}
