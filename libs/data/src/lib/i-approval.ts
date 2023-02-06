export type IApproval = {
  id: string;
  createdAt: Date;
  prompt?: string;
  command?: string;
  requestor: {
    email: string;
    avatarUrl: string;
  };
  responder?: {
    email: string;
  };
  status: ApprovalStatus;
  action: string;
  certificateAuthentication: boolean;
  destinationServer: string;
  destinationUserName: string;
  humanLocation: string;
  ip: string;
  port: string;
};

export enum ApprovalStatus {
  Open = 'requested',
  Approved = 'approved',
  Denied = 'denied',
  Cancelled = 'cancelled',
  TimedOut = 'timed out',
}
